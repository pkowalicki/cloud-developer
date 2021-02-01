import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Image } from '../models/Image'
import { createLogger } from '../utils/logger'
import { dynamoDB, s3 } from './awsClients'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('data-layer-images-access')

export class ImageAccess {

    constructor(
        private readonly docClient: DocumentClient = dynamoDB,
        private readonly s3Client: AWS.S3 = s3,
        private readonly imagesTable = process.env.IMAGES_TABLE,
        private readonly imagesIdIndex = process.env.IMAGE_ID_INDEX) {
    }


    async getImages(group: string): Promise<Image[]> {
        const result = await this.docClient.query({
            TableName: this.imagesTable,
            KeyConditionExpression: 'groupId = :groupId',
            ExpressionAttributeValues: {
                ':groupId': group
            }
        }).promise()

        const items = result.Items
        logger.info(`Found ${items.length} images for group ${group}`, { group: group, numberOfItems: items.length })

        return items as Image[]
    }

    async findImage(id: string): Promise<Image> {
        const result = await this.docClient.query({
            TableName: this.imagesTable,
            IndexName: this.imagesIdIndex,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': id
            }
        }).promise()

        if (result.Count !== 0) {
            const item = result.Items[0]

            logger.info(`Found image with id ${id}`, { ...item })

            return {
                ...item
            } as Image
        }

        logger.warn(`No image with id ${id} found`, {})

        return undefined
    }

    async createImage(newImage: Image): Promise<Image> {
        const newItem = {
            ...newImage,
            imageUrl: `https://${bucketName}.s3.amazonaws.com/${newImage.id}`,
        }

        await this.docClient.put({
            TableName: this.imagesTable,
            Item: newItem
        }).promise()

        const uploadUrl: string = await this.getUploadUrl(newImage.id)
        
        return {
            ...newItem,
            uploadUrl: uploadUrl
        }
    }

    async getUploadUrl(imageId: string): Promise<string> {
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: imageId,
            Expires: Number.parseInt(urlExpiration)
          })
    }
} // end of groups data access class

