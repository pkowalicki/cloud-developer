import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'


const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  console.log('Images table name: ', imagesTable)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)
  const parsedBody = JSON.parse(event.body)

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const newImageItem = {
    groupId: groupId,
      timestamp : Date.now().toString(),
      imageId: uuid.v4(),
      ...parsedBody
  };

  // TODO: Create an image
  await docClient.put({
    TableName: imagesTable,
    Item : newImageItem
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newImageItem)
  }
}

async function groupExists(groupId: string) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}
