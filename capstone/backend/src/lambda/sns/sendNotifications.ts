import { SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import { ConnectionsAccess } from '../../dataLayer/connectionsAccess'

const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.eu-central-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)
const logger = createLogger('lambda-send-notifications')
const connectionsAccess = new ConnectionsAccess()

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info(`Processing notification event`, { ...event })

  for (const snsRecord of event.Records) {
    const messageAttributes = snsRecord.Sns.MessageAttributes
    const connections: string[] = await connectionsAccess.getConnections()
    logger.info(`Found connections ${JSON.stringify(connections)}`)

    for (const connection of connections) {
      await sendMessageToClient(connection, messageAttributes)
    }
  }
}

async function sendMessageToClient(connectionId: string, payload: any) {
  try {
    logger.info(`Sending message to a connection ${connectionId}`, {...payload})

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload),
    }).promise()

    logger.info(`Message sent to connection ${connectionId}`, {payload: payload})
  } catch (e) {
    logger.warn(`Failed to send message`, { ...e })

    if (e.statusCode === 410) {
      logger.info(`Stale connection ${connectionId}`)
      await connectionsAccess.removeConnection(connectionId)
    }
  }
}