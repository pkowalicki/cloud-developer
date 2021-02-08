import { apiEndpoint } from '../config'
import { ImageModel } from '../types/ImageModel'
import { ImageUploadInfo } from '../types/ImageUploadInfo'
import { ImageUploadResponse } from '../types/ImageUploadResponse'
import Axios from 'axios'


export async function getImages(groupId: string): Promise<ImageModel[]> {
  console.log('Fetching images')
  const response = await fetch(`${apiEndpoint}/groups/${groupId}/images`)
  const result = await response.json()

  return result.items
}

export async function getImagesAuth(idToken: string, groupId: string): Promise<ImageModel[]> {
  console.log('Fetching images')

  const response = await Axios.get(`${apiEndpoint}/groups/${groupId}/images`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })

  return response.data.items
}

export async function createImage(
  idToken: string,
  newImage: ImageUploadInfo
): Promise<ImageUploadResponse> {

  const reply = await fetch(
    `${apiEndpoint}/groups/${newImage.groupId}/images`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        title: newImage.title
      })
    }
  )

  return await reply.json()
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file
  })
}
