import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
//import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('data-layer-todo-access')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3Client = createS3Client(),
    private readonly todoItemsTable: string = process.env.TODO_TABLE,
    private readonly todoIdIndex = process.env.INDEX_NAME) {
  }

  async GetAllTodos(userId: string): Promise<TodoItem[]> {
    const allItems = await this.docClient.query({
      TableName: this.todoItemsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const result = allItems.Items

    logger.info(`Found ${result.length} items for user ${userId}`, { user: userId, numberOfItems: result.length })

    return result as TodoItem[]
  }

  async CreateTodo(newTodoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoItemsTable,
      Item: newTodoItem
    }).promise()

    logger.info(`New TODO item created`, { ...newTodoItem })

    return newTodoItem
  }

  async DeleteTodo(userId: string, todoId: string): Promise<boolean> {
    const todoItem: TodoItem = await this.FindTodo(todoId)

    if (todoItem) {
      await this.docClient.delete({
        TableName: this.todoItemsTable,
        Key: {
          'userId': userId,
          'createdAt': todoItem.createdAt
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      }).promise()

      logger.info(`Deleted TODO item with id ${todoId} for user ${userId}`, { user: userId, todoId: todoId })

      return true

    } else {
      logger.warn(`Could not find TODO item with id ${todoItem}`, { user: userId, todoId: todoItem })

      return false
    }
  }


  async UpdateTodo(userId: string, todoId: string, update: TodoUpdate): Promise<boolean> {
    const todoItem: TodoItem = await this.FindTodo(todoId)

    if (todoItem) {
      const newDueDateISO: string = new Date(update.dueDate).toISOString()

      await this.docClient.update({
        TableName: this.todoItemsTable,
        Key: {
          'userId': userId,
          'createdAt': todoItem.createdAt
        },
        UpdateExpression: 'set #nameAttribute = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#nameAttribute': 'name'
        },
        ExpressionAttributeValues: {
          ':name': update.name,
          ':dueDate': newDueDateISO,
          ':done': update.done
        }
      }).promise()

      logger.info(`TODO item with id ${todoId} updated`, { todoId: todoId, update: update })

      return true

    } else {
      logger.warn(`Could not update TODO item with id: ${todoItem}`, { user: userId, todoId: todoItem })

      return false
    }
  }


  async UpdateAttachmentUrl(userId: string, todoId: string): Promise<string> {
    const todoItem: TodoItem = await this.FindTodo(todoId)

    if (todoItem) {
      const attachmentUrl: string = `https://${bucketName}.s3.amazonaws.com/${todoId}`

      await this.docClient.update({
        TableName: this.todoItemsTable,
        Key: {
          'userId': userId,
          'createdAt': todoItem.createdAt
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()

      logger.info(`Attachment URL updated for item: ${attachmentUrl}`, { attachmentUrl: attachmentUrl, todoId : todoId, user: userId })

      return this.getUploadUrl(todoId)
    } else {
      logger.warn(`Could not update attachment URL for item with id: ${todoItem}`, { user: userId, todoId: todoItem })

      return ''
    }
  }

  async FindTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todoItemsTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise()

    if (result.Count !== 0) {
      const item = result.Items[0]

      logger.info(`Found todo indexed item with id ${todoId}`, { ...item })

      return {
        ...item
      } as TodoItem
    }

    logger.warn(`No TODO item found for id ${todoId}`, {})

    return undefined
  }

  getUploadUrl(todoId: string): string {
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
  }

} // end of data access class


function createDynamoDBClient() {
  const localParams = {
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  }

  let client

  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')

    client = new AWS.DynamoDB.DocumentClient({
      service: new AWS.DynamoDB(localParams)
    });
  } else {
    console.log('Crating client for remote DB instance')

    client = new AWS.DynamoDB.DocumentClient({
      service: new AWS.DynamoDB()
    })
  }

  AWSXRay.captureAWSClient(client.service)

  return client
}


function createS3Client() {
  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })

  return AWSXRay.captureAWSClient(s3)
}