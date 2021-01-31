import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const docClient = createDynamoDBClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect', event)

  const connectionId = event.requestContext.connectionId
  const timestamp = new Date().toISOString()

  const item = {
    id: connectionId,
    timestamp
  }

  console.log('Storing item: ', item)

  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {
    statusCode: 200,
    body: ''
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
