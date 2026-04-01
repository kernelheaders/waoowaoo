/**
 * KIE.ai 生成器（图像 + 视频）
 *
 * 图像模型：
 * - Nano Banana 2 - nano-banana-2
 * - Nano Banana Pro - nano-banana-pro
 * - Nano Banana - nano-banana
 * - Nano Banana Edit - nano-banana-edit
 * - Imagen 4 - imagen4
 * - Imagen 4 Fast - imagen4-fast
 * - Imagen 4 Ultra - imagen4-ultra
 *
 * 视频模型：
 * - Kling 2.6 I2V - kling-2.6/image-to-video
 * - Kling 2.6 T2V - kling-2.6/text-to-video
 * - Wan 2.6 I2V - wan-2.6/image-to-video
 * - Wan 2.6 T2V - wan-2.6/text-to-video
 * - Hailuo 2.3 Pro I2V - hailuo-2.3/image-to-video-pro
 * - Bytedance Seedance 1.5 Pro - bytedance/seedance-1-5-pro
 */

import {
    BaseImageGenerator,
    BaseVideoGenerator,
    type ImageGenerateParams,
    type VideoGenerateParams,
    type GenerateResult,
} from './base'
import { getProviderConfig } from '@/lib/api-config'
import { createScopedLogger } from '@/lib/logging/core'

const KIE_API_BASE = 'https://api.kie.ai'
const KIE_UPLOAD_BASE = 'https://kieai.redpandaai.co'

// ============================================================
// KIE 文件上传：将 base64 图片上传到 KIE 获取 URL
// ============================================================

interface KieUploadResponse {
    success?: boolean
    code?: number
    data?: {
        fileUrl?: string
        downloadUrl?: string
    }
}

async function uploadBase64ToKie(
    apiKey: string,
    base64Data: string,
    index: number,
): Promise<string> {
    // Ensure data URI format: kie.ai expects "data:image/...;base64,..."
    let dataUri = base64Data
    if (!dataUri.startsWith('data:')) {
        dataUri = `data:image/jpeg;base64,${dataUri}`
    }

    const mimeType = dataUri.match(/^data:(image\/[a-z+]+);/i)?.[1] || 'image/jpeg'
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'

    const response = await fetch(`${KIE_UPLOAD_BASE}/api/file-base64-upload`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            base64Data: dataUri,
            uploadPath: 'waoowaoo-refs',
            fileName: `ref-${Date.now()}-${index}.${ext}`,
        }),
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`KIE_UPLOAD_FAILED: ${response.status} ${text.slice(0, 200)}`)
    }

    const data = (await response.json()) as KieUploadResponse
    const fileUrl = data.data?.fileUrl || data.data?.downloadUrl
    if (!fileUrl) {
        throw new Error('KIE_UPLOAD_NO_URL: Upload succeeded but no URL returned')
    }

    return fileUrl
}

/**
 * Convert reference images to KIE-accessible URLs.
 * If images are base64 data URIs, upload them to KIE first.
 * If they are already URLs, use them directly.
 */
async function resolveImageUrls(
    apiKey: string,
    images: string[],
): Promise<string[]> {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.startsWith('data:')) {
            urls.push(await uploadBase64ToKie(apiKey, img, i))
        } else if (img.startsWith('http://') || img.startsWith('https://')) {
            urls.push(img)
        } else {
            // Skip unsupported formats
        }
    }
    return urls
}

// ============================================================
// KIE 共用：提交异步任务
// ============================================================

interface KieTaskResponse {
    code: number
    msg: string
    data?: {
        taskId?: string
    }
}

async function submitKieTask(
    apiKey: string,
    model: string,
    input: Record<string, unknown>,
): Promise<{ taskId: string }> {
    const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, input }),
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`KIE_TASK_SUBMIT_FAILED: ${response.status} ${text.slice(0, 200)}`)
    }

    const data = (await response.json()) as KieTaskResponse

    if (data.code !== 200) {
        throw new Error(`KIE_ERROR: ${data.code} ${data.msg || 'Unknown error'}`)
    }

    const taskId = data.data?.taskId
    if (!taskId) {
        throw new Error('KIE_NO_TASK_ID: No taskId returned')
    }

    return { taskId }
}

// ============================================================
// KIE 图像生成器
// ============================================================

export class KieImageGenerator extends BaseImageGenerator {
    private readonly modelId: string

    constructor(modelId?: string) {
        super()
        this.modelId = modelId || 'nano-banana-2'
    }

    protected async doGenerate(params: ImageGenerateParams): Promise<GenerateResult> {
        const { userId, prompt, referenceImages = [], options = {} } = params

        const { apiKey } = await getProviderConfig(userId, 'kie')
        const {
            aspectRatio,
            resolution,
            outputFormat,
        } = options as {
            aspectRatio?: string
            resolution?: string
            outputFormat?: string
            provider?: string
            modelId?: string
            modelKey?: string
        }

        const logger = createScopedLogger({
            module: 'worker.kie-image',
            action: 'kie_image_generate',
        })
        logger.info({
            message: 'KIE image generation request',
            details: {
                modelId: this.modelId,
                referenceImagesCount: referenceImages.length,
                aspectRatio: aspectRatio ?? null,
                resolution: resolution ?? null,
            },
        })

        const input: Record<string, unknown> = { prompt }

        if (referenceImages.length > 0) {
            const imageUrls = await resolveImageUrls(apiKey, referenceImages)
            if (imageUrls.length > 0) {
                input.image_input = imageUrls
            }
            logger.info({
                message: 'KIE reference images resolved',
                details: { originalCount: referenceImages.length, resolvedCount: imageUrls.length },
            })
        }
        if (aspectRatio) {
            input.aspect_ratio = aspectRatio
        }
        if (resolution) {
            input.resolution = resolution
        }
        if (outputFormat) {
            input.output_format = outputFormat
        }

        const { taskId } = await submitKieTask(apiKey, this.modelId, input)

        logger.info({
            message: 'KIE image task submitted',
            details: { taskId, modelId: this.modelId },
        })

        return {
            success: true,
            async: true,
            requestId: taskId,
            externalId: `KIE:IMAGE:${taskId}`,
        }
    }
}

// ============================================================
// KIE 视频生成器
// ============================================================

// Model-specific image field mapping
// Different KIE video models use different field names for input images
const KIE_VIDEO_IMAGE_FIELD: Record<string, string> = {
    'hailuo/2-3-image-to-video-pro': 'image_url',      // singular, string
    'hailuo/2-3-image-to-video-standard': 'image_url',
    'hailuo/02-image-to-video-pro': 'image_url',
    'hailuo/02-image-to-video-standard': 'image_url',
    'bytedance/seedance-1.5-pro': 'input_urls',         // array
}
// Default: 'image_urls' (array) — used by kling, wan, grok-imagine, etc.

export class KieVideoGenerator extends BaseVideoGenerator {
    protected async doGenerate(params: VideoGenerateParams): Promise<GenerateResult> {
        const { userId, imageUrl, prompt = '', options = {} } = params

        const { apiKey } = await getProviderConfig(userId, 'kie')
        const {
            duration,
            aspectRatio,
            modelId = 'kling-2.6/image-to-video',
        } = options as {
            duration?: number
            aspectRatio?: string
            modelId?: string
            provider?: string
            modelKey?: string
        }

        const logger = createScopedLogger({
            module: 'worker.kie-video',
            action: 'kie_video_generate',
        })
        logger.info({
            message: 'KIE video generation request',
            details: { modelId, imageUrl: imageUrl?.substring(0, 80) },
        })

        const input: Record<string, unknown> = {}
        if (prompt) input.prompt = prompt

        // Resolve image (base64 → URL) and use correct field name per model
        if (imageUrl) {
            const resolvedUrls = await resolveImageUrls(apiKey, [imageUrl])
            if (resolvedUrls.length > 0) {
                const imageField = KIE_VIDEO_IMAGE_FIELD[modelId] || 'image_urls'
                if (imageField === 'image_url') {
                    // Singular string field (hailuo models)
                    input.image_url = resolvedUrls[0]
                } else {
                    // Array field (kling, wan, grok, bytedance, etc.)
                    input[imageField] = resolvedUrls
                }
            }
        }

        // Duration as string (KIE API expects string)
        if (typeof duration === 'number') input.duration = String(duration)
        if (aspectRatio) input.aspect_ratio = aspectRatio

        const { taskId } = await submitKieTask(apiKey, modelId, input)

        logger.info({
            message: 'KIE video task submitted',
            details: { taskId, modelId },
        })

        return {
            success: true,
            async: true,
            requestId: taskId,
            externalId: `KIE:VIDEO:${taskId}`,
        }
    }
}
