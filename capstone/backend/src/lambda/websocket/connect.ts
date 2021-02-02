import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { ConnectionsAccess } from '../../dataLayer/connectionsAccess'

const connectionsAccess = new ConnectionsAccess()
const logger = createLogger('lambda-ws-connect')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Websocket connect`, {event})
  const connectionId = event.requestContext.connectionId
  await connectionsAccess.addConnection(connectionId)

  return {
    statusCode: 200,
    body: ''
  }
}
