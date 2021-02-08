import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { EmailsAccess } from '../../dataLayer/emailsAccess'
import { RegisterEmailRequest } from '../../requests/RegisterEmailRequest'
import { getUserId } from '../utils'

const logger = createLogger('lambda-http-register-email')
const emailsAccess = new EmailsAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event`, { ...event })
    const request: RegisterEmailRequest = JSON.parse(event.body)
    const user: string = getUserId(event)
    await emailsAccess.registerEmail(request.email, user)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }
}
