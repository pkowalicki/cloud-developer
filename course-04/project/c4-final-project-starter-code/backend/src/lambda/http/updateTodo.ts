import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodoItem } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-todo-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: string = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const user: string = getUserId(event);
  const result: boolean = await updateTodoItem(user, todoId, updatedTodo)

  if (result) {
    logger.info(`Updated item: `, { todoId: todoId, update: updatedTodo})
    
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  } else {
    logger.error(`Unable to update TODO item`, { todoId: todoId, update: updatedTodo})

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({error: 'Unable to update TODO item'})
    }
  }
}
