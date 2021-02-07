import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getGroup, isMyGroup, updateGroup } from '../../businessLogic/groups'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { UpdateGroupRequest } from '../../requests/UpdateGroupRequest'
import { Group } from '../../models/Group'

const logger = createLogger('lambda-http-update-group')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const groupId: string = event.pathParameters.groupId
    const group: Group = await getGroup(groupId)
    const updateRequest: UpdateGroupRequest = JSON.parse(event.body)
    const user: string = getUserId(event)

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
            body: JSON.stringify({ error: 'Only owned groups can be updated' })
        }
    }

    const updateResult = await updateGroup(user, groupId, updateRequest)

    if (updateResult) {
        logger.info(`Updated group: `, { groupId: groupId, update: updateRequest })

        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({})
        }
    } else {
        logger.error(`Unable to update group: `, { groupId: groupId, update: updateRequest })

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ error: 'Unable to update group' })
        }
    }
}
