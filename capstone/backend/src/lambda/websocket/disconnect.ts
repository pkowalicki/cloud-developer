import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { ConnectionsAccess } from '../../dataLayer/connectionsAccess'

const logger = createLogger('lambda-ws-disconnect')
const connectionsAccess = new ConnectionsAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Websocket disconnect', {event})
  const connectionId = event.requestContext.connectionId
  await connectionsAccess.removeConnection(connectionId)

  return {
    statusCode: 200,
    body: ''
  }
}
