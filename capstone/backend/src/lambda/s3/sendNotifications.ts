import { SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
// import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const docClient = createDynamoDBClient()

// const connectionsTable = process.env.CONNECTIONS_TABLE
// const stage = process.env.STAGE
// const apiId = process.env.API_ID

// const connectionParams = {
//   apiVersion: "2018-11-29",
//   endpoint: `${apiId}.execute-api.eu-central-1.amazonaws.com/${stage}`
// }

// const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

const logger = createLogger('lambda-send-notifications')

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info(`Processing event`, {...event})
  // console.log('Processing SNS event ', JSON.stringify(event))
  // for (const snsRecord of event.Records) {
  //   const s3EventStr = snsRecord.Sns.Message
  //   console.log('Processing S3 event', s3EventStr)
  //   const s3Event = JSON.parse(s3EventStr)

  //   await processS3Event(s3Event)
  // }
}

// async function processS3Event(s3Event: S3Event) {
//   for (const record of s3Event.Records) {
//     const key = record.s3.object.key
//     console.log('Processing S3 item with key: ', key)

//     const connections = await docClient.scan({
//         TableName: connectionsTable
//     }).promise()

//     const payload = {
//         imageId: key
//     }

//     for (const connection of connections.Items) {
//         const connectionId = connection.id
//         await sendMessageToClient(connectionId, payload)
//     }
//   }
// }

// async function sendMessageToClient(connectionId, payload) {
//   try {
//     console.log('Sending message to a connection', connectionId)

//     await apiGateway.postToConnection({
//       ConnectionId: connectionId,
//       Data: JSON.stringify(payload),
//     }).promise()

//   } catch (e) {
//     console.log('Failed to send message', JSON.stringify(e))
//     if (e.statusCode === 410) {
//       console.log('Stale connection')

//       await docClient.delete({
//         TableName: connectionsTable,
//         Key: {
//           id: connectionId
//         }
//       }).promise()

//     }
//   }
// }

// function createDynamoDBClient() {
//   const localParams = {
//     region: 'localhost',
//     endpoint: 'http://localhost:8000'
//   }

//   let client

//   if (process.env.IS_OFFLINE) {
//     console.log('Creating a local DynamoDB instance')

//     client = new AWS.DynamoDB.DocumentClient({
//       service: new AWS.DynamoDB(localParams)
//     });
//   } else {
//     console.log('Crating client for remote DB instance')

//     client = new AWS.DynamoDB.DocumentClient({
//       service: new AWS.DynamoDB()
//     })
//   }

//   AWSXRay.captureAWSClient(client.service)

//   return client
// }