import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { EmailsAccess } from '../../dataLayer/emailsAccess'
import { RegisterEmailRequest } from '../../requests/RegisterEmailRequest'

const logger = createLogger('lambda-http-create-group')
const emailsAccess = new EmailsAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event`, { ...event })
    const request: RegisterEmailRequest = JSON.parse(event.body)
    await emailsAccess.registerEmail(request.email)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }
}
