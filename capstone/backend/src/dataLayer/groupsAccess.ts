import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Group } from '../models/Group'
import { createLogger } from '../utils/logger'
import { dynamoDB } from './awsClients'

const logger = createLogger('data-layer-groups-access')

export class GroupAccess {

  constructor(
    private readonly docClient: DocumentClient = dynamoDB,
    private readonly groupsTable = process.env.GROUPS_TABLE,
    private readonly groupsIdIndex = process.env.GROUPS_ID_INDEX) {
  }


  async getUserGroups(userId: string): Promise<Group[]> {

    const result = await this.docClient.query({
      TableName: this.groupsTable,
      KeyConditionExpression: 'userId = :userId AND public = :public',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':public': false
      }
    }).promise()

    const items = result.Items
    logger.info(`Found ${items.length} private groups for user ${userId}`, { user: userId, numberOfItems: items.length })
    
    return items as Group[]
  }


  async getPublicGroups(): Promise<Group[]> {
    const result = await this.docClient.query({
      TableName: this.groupsTable,
      IndexName: this.groupsIdIndex,
      KeyConditionExpression: 'public= :public',
      ExpressionAttributeValues: {
        ':public': true
      }
    }).promise()

    const items = result.Items
    logger.info(`Found ${items.length} public groups`, { numberOfItems: items.length })


    return items as Group[]
  }


  async getAllGroups(userId: string): Promise<Group[]> {
    return (await this.getUserGroups(userId))
      .concat(await this.getPublicGroups()) as Group[]
  }


  async createGroup(group: Group): Promise<Group> {
    await this.docClient.put({
      TableName: this.groupsTable,
      Item: group
    }).promise()

    logger.info(`New group created`, {...group})

    return group
  }


  async findGroup(groupId: string): Promise<Group> {

    const result = await this.docClient.query({
      TableName: this.groupsTable,
      IndexName: this.groupsIdIndex,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': groupId
      }
    }).promise()

    if (result.Count !== 0) {
      const item = result.Items[0]

      logger.info(`Found group with id ${groupId}`, {...item})

      return {
        ...item
      } as Group
    }

    logger.warn(`No group with id ${groupId} found`, {})

    return undefined
  }
} // end of groups data access class

