import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { dynamoDB } from './awsClients'

const logger = createLogger('data-layer-connections-access')

export class ConnectionsAccess {

  constructor(
    private readonly docClient: DocumentClient = dynamoDB,
    private readonly connectionsTable = process.env.CONNECTIONS_TABLE) {
  }

  async addConnection(connectionId: string): Promise<boolean> {
    const timestamp = new Date().toISOString()
  
    const item = {
      id: connectionId,
      timestamp
    }
  
    await this.docClient.put({
      TableName: this.connectionsTable,
      Item: item
    }).promise()

    logger.info(`Added websocket connection ${connectionId}`, {connectionId})
    
    return true
  }


  async removeConnection(connectionId: string): Promise<boolean> {
    await this.docClient.delete({
        TableName: this.connectionsTable,
        Key: {
            id: connectionId
        }
    }).promise()

    logger.info(`Removed websocket connection ${connectionId}`, {connectionId})

    return true
  }


  async getConnections(): Promise<string[]> {
    const connections = await this.docClient.scan({
      TableName: this.connectionsTable,
    }).promise()

    let connectionIds: string[] = []

    for (const connection of connections.Items)
      connectionIds.push(connection.id)

    return connectionIds
  }
} // end of connections data access class

