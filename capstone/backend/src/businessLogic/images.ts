import * as uuid from 'uuid'
import { ImageAccess } from '../dataLayer/imagesAccess'
import { Image } from '../models/Image'
import { CreateImageRequest } from '../requests/CreateImageRequest'

const imageAccess = new ImageAccess()

export async function getImages(group: string): Promise<Image[]> {
    return imageAccess.getImages(group)
}

export async function deleteImages(group: string): Promise<void> {
    await imageAccess.deleteImages(group)
}

export async function getImage(id: string): Promise<Image> {
    return imageAccess.findImage(id)
}

export async function createImage(newImage: CreateImageRequest, group: string): Promise<Image> {
    const imageId = uuid.v4()

    return await imageAccess.createImage({
        id: imageId,
        title: newImage.title,
        groupId: group,
        createdAt: new Date().toISOString()
    })
}
