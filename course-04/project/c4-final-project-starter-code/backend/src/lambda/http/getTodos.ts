import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';
import { TodoItem } from '../../models/TodoItem';
import { getTodoItems } from '../../businessLogic/todo';
import { createLogger } from '../../utils/logger';

const logger = createLogger('get-todos-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const user = getUserId(event);
  const items: TodoItem[] = await getTodoItems(user)

  logger.info(`Numer of returned items: ${items.length}`, {})

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }
}

