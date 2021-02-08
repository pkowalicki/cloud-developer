import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { deleteGroup, getGroup, isMyGroup } from '../../businessLogic/groups'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { Group } from '../../models/Group'
import { deleteImages } from '../../businessLogic/images'

const logger = createLogger('lambda-http-update-group')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const groupId: string = event.pathParameters.groupId
    const group: Group = await getGroup(groupId)
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
            body: JSON.stringify({ 
                error: 'Only owned groups can be deleted' 
            })
        }
    }

    try {
        await deleteImages(groupId)
        await deleteGroup(groupId, user)
        logger.info(`Group ${groupId} deleted succesfully`)
    } catch (e) {
        logger.error(`Error deleting group ${groupId}`, {e})

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ 
                error: 'Error deleting group' 
            })
        }
    }

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }

}
