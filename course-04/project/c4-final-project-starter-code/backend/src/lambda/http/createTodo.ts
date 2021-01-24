import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodoItem } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('create-todo-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const user: string = getUserId(event);
  const item: TodoItem = await createTodoItem(newTodo, user)
  logger.info(`New TODO item created: `, {...item})

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
