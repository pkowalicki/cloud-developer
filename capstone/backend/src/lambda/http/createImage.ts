import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { groupExists } from '../../businessLogic/groups'
import { Image } from '../../models/Image'
import { CreateImageRequest } from '../../requests/CreateImageRequest'
import { createImage } from '../../businessLogic/images'


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if (!validGroupId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const requestBody: CreateImageRequest = JSON.parse(event.body)
  const newItem: Image = await createImage(requestBody, groupId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: newItem.uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)





