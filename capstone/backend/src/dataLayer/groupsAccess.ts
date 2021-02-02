import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Group } from '../models/Group'
import { GroupUpdate } from '../models/GroupUpdate'
import { createLogger } from '../utils/logger'
import { dynamoDB } from './awsClients'

const logger = createLogger('data-layer-groups-access')

export class GroupAccess {

  constructor(
    private readonly docClient: DocumentClient = dynamoDB,
    private readonly groupsTable = process.env.GROUPS_TABLE,
    private readonly groupsIdIndex = process.env.GROUPS_ID_INDEX,
    private readonly groupsPublicIndex = process.env.GROUPS_PUBLIC_INDEX) {
  }


  async getUserGroups(userId: string): Promise<Group[]> {
    const result = await this.docClient.query({
      TableName: this.groupsTable,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#publicAttribute = :public',
      ExpressionAttributeNames: {
        '#publicAttribute': 'public'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':public': 0
      }
    }).promise()

    const items = result.Items
    logger.info(`Found ${items.length} private groups for user ${userId}`, { user: userId, numberOfItems: items.length })
    
    return items as Group[]
  }


  async getPublicGroups(): Promise<Group[]> {
    const result = await this.docClient.query({
      TableName: this.groupsTable,
      IndexName: this.groupsPublicIndex,
      KeyConditionExpression: '#publicAttribute = :public',
      ExpressionAttributeNames: {
        '#publicAttribute': 'public'
      },
      ExpressionAttributeValues: {
        ':public': 1
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

  async updateGroup(user: string, groupId: string, update: GroupUpdate): Promise<boolean> {
    const group: Group = await this.findGroup(groupId)

    if (group) {
      await this.docClient.update({
        TableName: this.groupsTable,
        Key: {
          'userId': user,
          'createdAt': group.createdAt
        },
        UpdateExpression: 'set #nameAttr = :name, description = :description, #publicAttr = :public',
        ExpressionAttributeNames: {
          '#nameAttr':'name',
          '#publicAttr':'public'
        },
        ExpressionAttributeValues: {
          ':name':update.name,
          ':description':update.description,
          ':public':update.public
        }
      }).promise()

      logger.info(`Group with id ${groupId} was updated`, {'groupId':groupId, 'update': update})

      return true
    } else {
      logger.warn(`Could not find group with id ${groupId}`, {'user':user, 'groupId':groupId})

      return false
    }
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

