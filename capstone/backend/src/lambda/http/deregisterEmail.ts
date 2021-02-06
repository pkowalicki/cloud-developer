import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { EmailsAccess } from '../../dataLayer/emailsAccess'
import { getUserId } from '../utils'

const logger = createLogger('lambda-http-deregister-email')
const emailsAccess = new EmailsAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event`, { ...event })
    const user: string = getUserId(event)
    await emailsAccess.deregisterEmail(user)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }
}
