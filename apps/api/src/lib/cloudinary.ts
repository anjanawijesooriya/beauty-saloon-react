import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

export function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    return Promise.reject(new Error('Image upload is not configured on this server'))
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err || !result) reject(err ?? new Error('Upload failed'))
        else resolve(result.secure_url)
      })
      .end(buffer)
  })
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  if (!env.CLOUDINARY_CLOUD_NAME) return
  // Extract public_id: everything after /upload/ (or /upload/vXXX/) minus extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
  if (!match) return
  const publicId = match[1].replace(/\.[^/.]+$/, '')
  await cloudinary.uploader.destroy(publicId).catch(() => {})
}
