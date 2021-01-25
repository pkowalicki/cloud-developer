import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'


const logger = createLogger('generate-upload-url-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: string = event.pathParameters.todoId
  const user: string = getUserId(event)
  const uploadUrl: string = await updateAttachmentUrl(user, todoId)

  if (uploadUrl != '') {
    logger.info(`Created upload url for item ${todoId} and user ${user}`, {user: user, todoId: todoId, uploadUrl: uploadUrl})

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  } else {
    logger.error(`Unable to create uplaod URL for user ${user} and item id ${todoId}`, {user: user, todoId: todoId})

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({error: 'Unable to create uplaod URL'})
    }
  }
}

