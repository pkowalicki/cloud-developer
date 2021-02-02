import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { updateGroup } from '../../businessLogic/groups'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { UpdateGroupRequest } from '../../requests/UpdateGroupRequest'

const logger = createLogger('lambda-http-create-group')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const groupId: string = event.pathParameters.groupId
    const updateRequest: UpdateGroupRequest = JSON.parse(event.body)
    const user: string = getUserId(event)
    const updateResult = await updateGroup(user,groupId,updateRequest)
    
    if (updateResult) {
        logger.info(`Updated group: `, {groupId: groupId, update: updateRequest})

        return {
            statusCode: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({})
        }
    } else {
        logger.error(`Unable to update group: `, { groupId: groupId, update: updateRequest})

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({error: 'Unable to update group'})
        }
    }
}
