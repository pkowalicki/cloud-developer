import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { getImage } from '../../businessLogic/images'
import { Image } from '../../models/Image'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imageId = event.pathParameters.imageId
  const item: Image = await getImage(imageId)

  if (item) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(item)
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