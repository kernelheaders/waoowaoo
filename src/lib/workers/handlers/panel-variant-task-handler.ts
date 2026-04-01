import { type Job } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { getArtStylePrompt } from '@/lib/constants'
import { logInfo as _ulogInfo } from '@/lib/logging/core'
import { type TaskJobData } from '@/lib/task/types'
import {
  assertTaskActive,
  getProjectModels,
  resolveImageSourceFromGeneration,
  toSignedUrlIfCos,
  uploadImageSourceToCos,
} from '../utils'
import { normalizeReferenceImagesForGeneration } from '@/lib/media/outbound-image'
import {
  AnyObj,
  findCharacterByName,
  parseImageUrls,
  parsePanelCharacterReferences,
  pickFirstString,
  resolveNovelData,
} from './image-task-handler-shared'
import { buildPrompt, PROMPT_IDS } from '@/lib/prompt-i18n'

// ── Build variant prompt ──────────────────────────────────────
interface VariantPromptParams {
  locale: TaskJobData['locale']
  originalDescription: string
  originalShotType: string
  originalCameraMove: string
  location: string
  charactersInfo: string
  variantTitle: string
  variantDescription: string
  targetShotType: string
  targetCameraMove: string
  videoPrompt: string
  characterAssets: string
  locationAsset: string
  aspectRatio: string
  style: string
}

function buildVariantPrompt(params: VariantPromptParams): string {
  return buildPrompt({
    promptId: PROMPT_IDS.NP_AGENT_SHOT_VARIANT_GENERATE,
    locale: params.locale,
    variables: {
      original_description: params.originalDescription,
      original_shot_type: params.originalShotType,
      original_camera_move: params.originalCameraMove,
      location: params.location,
      characters_info: params.charactersInfo,
      variant_title: params.variantTitle,
      variant_description: params.variantDescription,
      target_shot_type: params.targetShotType,
      target_camera_move: params.targetCameraMove,
      video_prompt: params.videoPrompt,
      character_assets: params.characterAssets,
      location_asset: params.locationAsset,
      aspect_ratio: params.aspectRatio,
      style: params.style,
    },
  })
}

// ── Build character and scene description info ─────────────────────────────
function buildCharactersInfo(
  panel: { characters: string | null },
  projectData: { characters?: Array<{ name: string; introduction?: string | null; appearances?: Array<{ changeReason?: string | null }> }> },
): string {
  const panelCharacters = parsePanelCharacterReferences(panel.characters)
  if (panelCharacters.length === 0) return 'No character'

  return panelCharacters.map(item => {
    const character = findCharacterByName(projectData.characters || [], item.name)
    const intro = character?.introduction || ''
    const appearance = item.appearance || 'Default appearance'
    return `- ${item.name}（${appearance}）${intro ? `：${intro}` : ''}`
  }).join('\n')
}

function buildCharacterAssetsDescription(
  panel: { characters: string | null },
  projectData: { characters?: Array<{ name: string; appearances?: Array<{ changeReason?: string | null; imageUrl?: string | null }> }> },
): string {
  const panelCharacters = parsePanelCharacterReferences(panel.characters)
  if (panelCharacters.length === 0) return 'No character reference'

  return panelCharacters.map(item => {
    const character = findCharacterByName(projectData.characters || [], item.name)
    if (!character) return `- ${item.name}: No reference image`
    const hasAppearance = (character.appearances || []).length > 0
    return `- ${item.name}: ${hasAppearance ? 'Reference provided' : 'No reference image'}`
  }).join('\n')
}

function buildLocationAssetDescription(params: {
  includeLocationAsset: boolean
  locationName: string
  locale: TaskJobData['locale']
}): string {
  if (params.locationName) {
    if (params.includeLocationAsset) return `Scene: ${params.locationName}`
    return 'Scene reference not used'
  }
  return 'No scene reference'
}

function buildVariantReferenceImages(params: {
  includeCharacterAssets: boolean
  includeLocationAsset: boolean
  newPanel: {
    characters: string | null
    location: string | null
  }
  sourcePanelImageUrl: string | null
  projectData: Awaited<ReturnType<typeof resolveNovelData>>
}): string[] {
  const refs: string[] = []
  if (params.sourcePanelImageUrl) refs.push(params.sourcePanelImageUrl)

  if (params.includeCharacterAssets) {
    const panelCharacters = parsePanelCharacterReferences(params.newPanel.characters)
    for (const item of panelCharacters) {
      const character = findCharacterByName(params.projectData.characters || [], item.name)
      if (!character) continue

      const appearances = character.appearances || []
      let appearance = appearances[0]
      if (item.appearance) {
        const matched = appearances.find((candidate) => (candidate.changeReason || '').toLowerCase() === item.appearance!.toLowerCase())
        if (matched) appearance = matched
      }

      if (!appearance) continue
      const imageUrls = parseImageUrls((appearance as { imageUrls?: string | null }).imageUrls || null, 'characterAppearance.imageUrls')
      const selectedIndex = typeof (appearance as { selectedIndex?: number | null }).selectedIndex === 'number'
        ? (appearance as { selectedIndex?: number | null }).selectedIndex
        : null
      const selectedUrl = (selectedIndex !== null && selectedIndex !== undefined ? imageUrls[selectedIndex] : null)
        || imageUrls[0]
        || appearance.imageUrl
        || null
      const signed = toSignedUrlIfCos(selectedUrl, 3600)
      if (signed) refs.push(signed)
    }
  }

  if (params.includeLocationAsset && params.newPanel.location) {
    const location = (params.projectData.locations || []).find(
      (item) => item.name.toLowerCase() === params.newPanel.location!.toLowerCase(),
    )
    if (location) {
      const selected = (location.images || []).find((image) => image.isSelected) || location.images?.[0]
      const signed = toSignedUrlIfCos(selected?.imageUrl, 3600)
      if (signed) refs.push(signed)
    }
  }

  return refs
}

interface PanelVariantPayload {
  shot_type?: string
  camera_move?: string
  description?: string
  video_prompt?: string
  title?: string
  location?: string
  characters?: unknown
}

export async function handlePanelVariantTask(job: Job<TaskJobData>) {
  const payload = (job.data.payload || {}) as AnyObj
  const newPanelId = pickFirstString(payload.newPanelId)
  const sourcePanelId = pickFirstString(payload.sourcePanelId)
  const includeCharacterAssets = payload.includeCharacterAssets !== false
  const includeLocationAsset = payload.includeLocationAsset !== false
  const variant: PanelVariantPayload = payload.variant && typeof payload.variant === 'object'
    ? (payload.variant as PanelVariantPayload)
    : {}

  if (!newPanelId || !sourcePanelId) {
    throw new Error('panel_variant missing newPanelId/sourcePanelId')
  }

  // Panel was already created in API route, here we just need to fetch it
  const newPanel = await prisma.novelPromotionPanel.findUnique({ where: { id: newPanelId } })
  if (!newPanel) throw new Error('New panel not found (should have been created by API route)')

  const sourcePanel = await prisma.novelPromotionPanel.findUnique({ where: { id: sourcePanelId } })
  if (!sourcePanel) throw new Error('Source panel not found')

  const projectData = await resolveNovelData(job.data.projectId)
  if (!projectData.videoRatio) throw new Error('Project videoRatio not configured')
  const aspectRatio = projectData.videoRatio

  const modelConfig = await getProjectModels(job.data.projectId, job.data.userId)
  const storyboardModel = modelConfig.storyboardModel
  if (!storyboardModel) throw new Error('Storyboard model not configured')

  // Collect reference images (shared pipeline with panel-image-task-handler)
  const sourcePanelImageUrl = toSignedUrlIfCos(sourcePanel.imageUrl, 3600)
  const refs = buildVariantReferenceImages({
    includeCharacterAssets,
    includeLocationAsset,
    newPanel,
    sourcePanelImageUrl,
    projectData,
  })
  const normalizedRefs = await normalizeReferenceImagesForGeneration(refs)

  // Use agent_shot_variant_generate.txt prompt template
  const artStyle = getArtStylePrompt(modelConfig.artStyle, job.data.locale)
  const charactersInfo = buildCharactersInfo(newPanel, projectData)
  const characterAssetsDesc = includeCharacterAssets
    ? buildCharacterAssetsDescription(newPanel, projectData)
    : 'Character reference images disabled'
  const locationName = newPanel.location || sourcePanel.location || ''

  const prompt = buildVariantPrompt({
    locale: job.data.locale,
    originalDescription: sourcePanel.description || '',
    originalShotType: sourcePanel.shotType || '',
    originalCameraMove: sourcePanel.cameraMove || '',
    location: locationName,
    charactersInfo,
    variantTitle: pickFirstString(variant.title) || 'Shot variant',
    variantDescription: variant.description || '',
    targetShotType: variant.shot_type || sourcePanel.shotType || '',
    targetCameraMove: variant.camera_move || sourcePanel.cameraMove || '',
    videoPrompt: pickFirstString(variant.video_prompt, variant.description) || '',
    characterAssets: characterAssetsDesc,
    locationAsset: buildLocationAssetDescription({
      includeLocationAsset,
      locationName,
      locale: job.data.locale,
    }),
    aspectRatio,
    style: artStyle || 'Consistent with reference image style',
  })

  _ulogInfo('[panel-variant] resolved variant prompt', prompt)

  await assertTaskActive(job, 'generate_panel_variant_image')
  const source = await resolveImageSourceFromGeneration(job, {
    userId: job.data.userId,
    modelId: storyboardModel,
    prompt,
    options: {
      referenceImages: normalizedRefs,
      aspectRatio,
    },
  })

  const cosKey = await uploadImageSourceToCos(source, 'panel-variant', newPanel.id)

  await assertTaskActive(job, 'persist_panel_variant')
  await prisma.novelPromotionPanel.update({
    where: { id: newPanel.id },
    data: { imageUrl: cosKey },
  })

  return {
    panelId: newPanel.id,
    storyboardId: newPanel.storyboardId,
    imageUrl: cosKey,
  }
}
