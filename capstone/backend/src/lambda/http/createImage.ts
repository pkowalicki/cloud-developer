import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getGroup, isMyGroup } from '../../businessLogic/groups'
import { Image } from '../../models/Image'
import { CreateImageRequest } from '../../requests/CreateImageRequest'
import { createImage } from '../../businessLogic/images'
import { getUserId } from '../utils'
import { Group } from '../../models/Group'


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const groupId = event.pathParameters.groupId
  const user = getUserId(event)

  //const validGroupId = await groupExists(groupId)
  const group: Group = await getGroup(groupId)

  if (!group) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  if (!isMyGroup(user, group)) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Images can be uploaded only to own groups' })
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





