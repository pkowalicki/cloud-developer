import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
//import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoItemsTable: string = process.env.TODO_TABLE,
        private readonly todoIdIndex = process.env.INDEX_NAME){
    }

    async GetAllTodos(userId: string): Promise<TodoItem[]> {

        console.log('Getting all todo items for user :')
    
        const allItems = await this.docClient.query({
            TableName: this.todoItemsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
          }).promise()

        const result = allItems.Items
        
        return result as TodoItem[]
    }
    
    async CreateTodo(newTodoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoItemsTable,
            Item: newTodoItem
          }).promise()

        return newTodoItem
    }

    async DeleteTodo(userId: string, todoId: string): Promise<{}> {
        const todoItem: TodoItem = await this.FindTodo(todoId)

        await this.docClient.delete({
            TableName: this.todoItemsTable,
            Key: {
                'userId' : userId,
                'createdAt': todoItem.createdAt
            },
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
              ':todoId': todoId
            }
          }).promise()
        
        return {}
    }


    async UpdateTodo(userId: string, todoId: string, update: TodoUpdate): Promise<{}> {
      const todoItem: TodoItem = await this.FindTodo(todoId)
      const newDueDateISO: string = new Date(update.dueDate).toISOString()

      await this.docClient.update({
            TableName: this.todoItemsTable,
            Key: {
                'userId' : userId,
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

      return {}
    }

    async FindTodo(todoId: string): Promise<TodoItem> {
        console.log('Looking for todo item for todoid: ', todoId)
        const result = await this.docClient.query({
            TableName: this.todoItemsTable,
            IndexName : this.todoIdIndex,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
              ':todoId': todoId
            }
          }).promise()

        if (result.Count !== 0) {
          const item = result.Items[0]

          console.log('Found todo item: ', JSON.stringify(item))

          return {
            ...item
          } as TodoItem

          // return {
          //   userId: item.userId,
          //   todoId: item.todoId,
          //   createdAt: item.createdAt,
          //   name: item.name,
          //   dueDate: item.dueDate,
          //   done: item.done,
          //   attachmentUrl: item.attachmentUrl
          // }
        }
        
        return undefined
    }

}


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
