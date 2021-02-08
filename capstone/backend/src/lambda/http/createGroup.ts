import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'

import { CreateGroupRequest } from '../../requests/CreateGroupRequest'
import { createGroup } from '../../businessLogic/groups'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('lambda-http-create-group')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event`, { ...event })
  const newGroupRequest: CreateGroupRequest = JSON.parse(event.body)
  logger.info(`Processing new group request`, {...newGroupRequest})
  const user: string = getUserId(event)
  const newGroup = await createGroup(newGroupRequest,user)
  logger.info(`New group created for user ${user}`, {...newGroup})

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newGroup
    })
  }
}
