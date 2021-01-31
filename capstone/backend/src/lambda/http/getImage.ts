import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'


const docClient = createDynamoDBClient()

const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const imageId = event.pathParameters.imageId

  const result = await docClient.query({
      TableName : imagesTable,
      IndexName : imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
          ':imageId': imageId
      }
  }).promise()

  if (result.Count !== 0) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Items[0])
    }
  }

  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
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
