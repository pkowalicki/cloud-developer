import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { deleteTodoItem } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete-todo-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: string = event.pathParameters.todoId
  const user: string = getUserId(event);
  const result: boolean = await deleteTodoItem(user, todoId)

  if (result) {
    logger.info(`Deleted TODO item with id: ${todoId}`, { user: user, todoId: todoId })

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  } else {
    logger.error(`Unable to delete TODO item`, { user: user, todoId: todoId })

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Unable to delte TODO item' })
    }
  }
}
