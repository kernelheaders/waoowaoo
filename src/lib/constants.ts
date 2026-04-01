/**
 * 主形象的 appearanceIndex 值。
 * 所有判断主/子形象的逻辑必须引用此常量，禁止硬编码数字。
 * 子形象的 appearanceIndex 从 PRIMARY_APPEARANCE_INDEX + 1 开始递增。
 */
export const PRIMARY_APPEARANCE_INDEX = 0

// 比例配置（nanobanana 支持的所有比例，按常用程度排序）
export const ASPECT_RATIO_CONFIGS: Record<string, { label: string; isVertical: boolean }> = {
  '16:9': { label: '16:9', isVertical: false },
  '9:16': { label: '9:16', isVertical: true },
  '1:1': { label: '1:1', isVertical: false },
  '3:2': { label: '3:2', isVertical: false },
  '2:3': { label: '2:3', isVertical: true },
  '4:3': { label: '4:3', isVertical: false },
  '3:4': { label: '3:4', isVertical: true },
  '5:4': { label: '5:4', isVertical: false },
  '4:5': { label: '4:5', isVertical: true },
  '21:9': { label: '21:9', isVertical: false },
}

// 配置页面使用的选项列表（从 ASPECT_RATIO_CONFIGS 派生）
export const VIDEO_RATIOS = Object.entries(ASPECT_RATIO_CONFIGS).map(([value, config]) => ({
  value,
  label: config.label
}))

// 获取比例配置
export function getAspectRatioConfig(ratio: string) {
  return ASPECT_RATIO_CONFIGS[ratio] || ASPECT_RATIO_CONFIGS['16:9']
}

export const ANALYSIS_MODELS = [
  { value: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'google/gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' }
]

export const IMAGE_MODELS = [
  { value: 'doubao-seedream-4-5-251128', label: 'Seedream 4.5' },
  { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0' }
]

// 图像模型选项（ 生成完整图片）
export const IMAGE_MODEL_OPTIONS = [
  { value: 'banana', label: 'Banana Pro (FAL)' },
  { value: 'banana-2', label: 'Banana 2 (FAL)' },
  { value: 'gemini-3-pro-image-preview', label: 'Banana (Google)' },
  { value: 'gemini-3-pro-image-preview-batch', label: 'Banana (Google Batch) %50 Tasarruf' },
  { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0' },
  { value: 'doubao-seedream-4-5-251128', label: 'Seedream 4.5' },
  { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0 (Google)' },
  { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4.0 Ultra' },
  { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast' }
]

// Banana 模型分辨率选项（仅用于九宫格分镜图，单张生成固定2K）
export const BANANA_RESOLUTION_OPTIONS = [
  { value: '2K', label: '2K (Önerilen, Hızlı)' },
  { value: '4K', label: '4K (Yüksek Kalite, Yavaş)' }
]

// 支持分辨率选择的 Banana 模型
export const BANANA_MODELS = ['banana', 'banana-2', 'gemini-3-pro-image-preview', 'gemini-3-pro-image-preview-batch']

export const VIDEO_MODELS = [
  { value: 'doubao-seedance-1-0-pro-fast-251015', label: 'Seedance 1.0 Pro Fast' },
  { value: 'doubao-seedance-1-0-pro-fast-251015-batch', label: 'Seedance 1.0 Pro Fast (Toplu) %50 Tasarruf' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428', label: 'Seedance 1.0 Lite' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428-batch', label: 'Seedance 1.0 Lite (Toplu) %50 Tasarruf' },
  { value: 'doubao-seedance-1-5-pro-251215', label: 'Seedance 1.5 Pro' },
  { value: 'doubao-seedance-1-5-pro-251215-batch', label: 'Seedance 1.5 Pro (Toplu) %50 Tasarruf' },
  { value: 'doubao-seedance-1-0-pro-250528', label: 'Seedance 1.0 Pro' },
  { value: 'doubao-seedance-1-0-pro-250528-batch', label: 'Seedance 1.0 Pro (Toplu) %50 Tasarruf' },
  { value: 'fal-wan25', label: 'Wan 2.6' },
  { value: 'fal-veo31', label: 'Veo 3.1 Fast' },
  { value: 'fal-sora2', label: 'Sora 2' },
  { value: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', label: 'Kling 2.5 Turbo Pro' },
  { value: 'fal-ai/kling-video/v3/standard/image-to-video', label: 'Kling 3 Standard' },
  { value: 'fal-ai/kling-video/v3/pro/image-to-video', label: 'Kling 3 Pro' }
]

// SeeDream 批量模型列表（使用 GPU 空闲时间，成本降低50%）
export const SEEDANCE_BATCH_MODELS = [
  'doubao-seedance-1-5-pro-251215-batch',
  'doubao-seedance-1-0-pro-250528-batch',
  'doubao-seedance-1-0-pro-fast-251015-batch',
  'doubao-seedance-1-0-lite-i2v-250428-batch',
]

// 支持生成音频的模型（仅 Seedance 1.5 Pro 支持，包含批量版本）
export const AUDIO_SUPPORTED_MODELS = ['doubao-seedance-1-5-pro-251215', 'doubao-seedance-1-5-pro-251215-batch']

// 首尾帧视频模型（能力权威来源是 standards/capabilities；此常量仅作静态兜底展示）
export const FIRST_LAST_FRAME_MODELS = [
  { value: 'doubao-seedance-1-5-pro-251215', label: 'Seedance 1.5 Pro (İlk-Son Kare)' },
  { value: 'doubao-seedance-1-5-pro-251215-batch', label: 'Seedance 1.5 Pro (首尾帧/批量) %50 Tasarruf' },
  { value: 'doubao-seedance-1-0-pro-250528', label: 'Seedance 1.0 Pro (İlk-Son Kare)' },
  { value: 'doubao-seedance-1-0-pro-250528-batch', label: 'Seedance 1.0 Pro (首尾帧/批量) %50 Tasarruf' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428', label: 'Seedance 1.0 Lite (İlk-Son Kare)' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428-batch', label: 'Seedance 1.0 Lite (首尾帧/批量) %50 Tasarruf' },
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1 (İlk-Son Kare)' },
  { value: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast (İlk-Son Kare)' }
]

export const VIDEO_RESOLUTIONS = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' }
]

export const TTS_RATES = [
  { value: '+0%', label: 'Normal (1.0x)' },
  { value: '+20%', label: 'Hafif Hızlı (1.2x)' },
  { value: '+50%', label: 'Hızlı (1.5x)' },
  { value: '+100%', label: 'Çok Hızlı (2.0x)' }
]

export const TTS_VOICES = [
  { value: 'tr-TR-AhmetNeural', label: 'Ahmet (Erkek)', preview: 'E' },
  { value: 'tr-TR-EmelNeural', label: 'Emel (Kadın)', preview: 'K' },
  { value: 'en-US-GuyNeural', label: 'Guy (Erkek EN)', preview: 'E' },
  { value: 'en-US-JennyNeural', label: 'Jenny (Kadın EN)', preview: 'K' },
]

export const ART_STYLES = [
  {
    value: 'american-comic',
    label: 'Anime',
    preview: 'A',
    promptTr: 'Japon anime tarzı',
    promptEn: 'Japanese anime style'
  },
  {
    value: 'chinese-comic',
    label: 'Premium Çizgi Roman',
    preview: 'P',
    promptTr: 'Modern yüksek kaliteli çizgi roman tarzı, zengin detaylar, keskin çizgiler, dolu doku, ultra net 2D anime estetiği.',
    promptEn: 'Modern premium comic style, rich details, clean sharp line art, full texture, ultra-clear 2D anime aesthetics.'
  },
  {
    value: 'japanese-anime',
    label: 'Japon Anime',
    preview: 'J',
    promptTr: 'Modern Japon anime tarzı, cel shading, temiz çizgi sanatı, görsel roman CG görünümü, yüksek kaliteli 2D tarz.',
    promptEn: 'Modern Japanese anime style, cel shading, clean line art, visual-novel CG look, high-quality 2D style.'
  },
  {
    value: 'realistic',
    label: 'Gerçekçi',
    preview: 'G',
    promptTr: 'Gerçekçi sinematik görünüm, gerçek dünya sahne sadakati, zengin ve canlı renkler, temiz ve rafine görüntü kalitesi.',
    promptEn: 'Realistic cinematic look, real-world scene fidelity, rich transparent colors, clean and refined image quality.'
  }
]

export type ArtStyleValue = (typeof ART_STYLES)[number]['value']

export function isArtStyleValue(value: unknown): value is ArtStyleValue {
  return typeof value === 'string' && ART_STYLES.some((style) => style.value === value)
}

/**
 * 🔥 实时从 ART_STYLES 常量获取风格 prompt
 * 这是获取风格 prompt 的唯一正确方式，确保始终使用最新的常量定义
 * 
 * @param artStyle - 风格标识符，如 'realistic', 'american-comic' 等
 * @returns 对应的风格 prompt，如果找不到则返回空字符串
 */
export function getArtStylePrompt(
  artStyle: string | null | undefined,
  locale: 'tr' | 'en',
): string {
  if (!artStyle) return ''
  const style = ART_STYLES.find(s => s.value === artStyle)
  if (!style) return ''
  return locale === 'en' ? style.promptEn : style.promptTr
}

// 角色形象生成的系统后缀（始终添加到提示词末尾，不显示给用户）- 左侧面部特写+右侧三视图
export const CHARACTER_PROMPT_SUFFIX = 'Character reference sheet, image divided into left and right areas: [Left area] approximately 1/3 width, front close-up of the character (full face for humans, most recognizable front view for animals/creatures); [Right area] approximately 2/3 width, three-view orthographic arranged horizontally (left to right: front full body, side full body, back full body), all views same height. Pure white background, no other elements.'

// 场景图片生成的系统后缀（已禁用四视图，直接生成单张场景图）
export const LOCATION_PROMPT_SUFFIX = ''

// 角色图片生成比例（16:9横版，左侧面部特写+右侧全身）
export const CHARACTER_IMAGE_RATIO = '16:9'
// 角色图片尺寸（用于Seedream API）
export const CHARACTER_IMAGE_SIZE = '3840x2160'  // 16:9 横版
// 角色图片尺寸（用于Banana API）
export const CHARACTER_IMAGE_BANANA_RATIO = '3:2'

// 场景图片生成比例（1:1 正方形单张场景）
export const LOCATION_IMAGE_RATIO = '1:1'
// 场景图片尺寸（用于Seedream API）- 4K
export const LOCATION_IMAGE_SIZE = '4096x4096'  // 1:1 正方形 4K
// 场景图片尺寸（用于Banana API）
export const LOCATION_IMAGE_BANANA_RATIO = '1:1'

// 从提示词中移除角色系统后缀（用于显示给用户）
export function removeCharacterPromptSuffix(prompt: string): string {
  if (!prompt) return ''
  return prompt.replace(CHARACTER_PROMPT_SUFFIX, '').trim()
}

// 添加角色系统后缀到提示词（用于生成图片）
export function addCharacterPromptSuffix(prompt: string): string {
  if (!prompt) return CHARACTER_PROMPT_SUFFIX
  const cleanPrompt = removeCharacterPromptSuffix(prompt)
  return `${cleanPrompt}${cleanPrompt ? '，' : ''}${CHARACTER_PROMPT_SUFFIX}`
}

// 从提示词中移除场景系统后缀（用于显示给用户）
export function removeLocationPromptSuffix(prompt: string): string {
  if (!prompt) return ''
  return prompt.replace(LOCATION_PROMPT_SUFFIX, '').replace(/，$/, '').trim()
}

// 添加场景系统后缀到提示词（用于生成图片）
export function addLocationPromptSuffix(prompt: string): string {
  // 后缀为空时直接返回原提示词
  if (!LOCATION_PROMPT_SUFFIX) return prompt || ''
  if (!prompt) return LOCATION_PROMPT_SUFFIX
  const cleanPrompt = removeLocationPromptSuffix(prompt)
  return `${cleanPrompt}${cleanPrompt ? '，' : ''}${LOCATION_PROMPT_SUFFIX}`
}

/**
 * 构建角色介绍字符串（用于发送给 AI，帮助理解"我"和称呼对应的角色）
 * @param characters - 角色列表，需要包含 name 和 introduction 字段
 * @returns 格式化的角色介绍字符串
 */
export function buildCharactersIntroduction(characters: Array<{ name: string; introduction?: string | null }>): string {
  if (!characters || characters.length === 0) return '暂无角色介绍'

  const introductions = characters
    .filter(c => c.introduction && c.introduction.trim())
    .map(c => `- ${c.name}：${c.introduction}`)

  if (introductions.length === 0) return '暂无角色介绍'

  return introductions.join('\n')
}
