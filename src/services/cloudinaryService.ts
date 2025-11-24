import { cloudinary } from '@/api/backendApi'

export interface CloudinarySignatureResponse {
  signature: string
  timestamp: number | string
  api_key: string
  cloud_name: string
  folder?: string
}

export async function uploadToCloudinary(file: File, tag = 'announcements'): Promise<string> {
  try {
    const signatureResponse = await cloudinary.getSignature(tag)
    const data: CloudinarySignatureResponse = signatureResponse.data

    const { signature, timestamp, api_key, cloud_name, folder } = data

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', api_key)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    if (folder) formData.append('folder', folder)

    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      throw new Error(`Cloudinary upload failed: ${resp.status} ${resp.statusText} ${txt}`)
    }

    const result = await resp.json()
    return result.secure_url
  } catch (err: any) {
    console.error('Cloudinary upload error:', err)
    throw err
  }
}
