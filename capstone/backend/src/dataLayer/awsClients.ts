
import { DocumentClient } from "aws-sdk/clients/dynamodb"

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
}

function createS3Client() {
    return new XAWS.S3({
        signatureVersion: 'v4'
    })
}

function createSNSClient() {
  return new XAWS.SNS({apiVersion: '2010-03-31'})
}

export const dynamoDB: DocumentClient = createDynamoDBClient()
export const s3: AWS.S3 = createS3Client()
export const sns: AWS.SNS = createSNSClient()