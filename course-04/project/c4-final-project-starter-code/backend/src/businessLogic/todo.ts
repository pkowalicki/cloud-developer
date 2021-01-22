import * as uuid from 'uuid'

import { TodoAccess } from "../dataLayer/todoAccess";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";

const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENTS_S3_BUCKET

export async function createTodoItem(item: CreateTodoRequest, user: string) : Promise<TodoItem> {

    const todoId = uuid.v4()
    const timestamp = new Date().toISOString()
    const dueDate = new Date(item.dueDate).toISOString()
    
    return await todoAccess.CreateTodo({
        userId: user,
        todoId: todoId,
        createdAt: timestamp,
        name: item.name,
        dueDate: dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })    
}

export async function getTodoItems(user: string): Promise<TodoItem[]> {
    return await todoAccess.GetAllTodos(user);
}

export async function deleteTodoItem(user: string, todoId: string): Promise<{}> {
    return await todoAccess.DeleteTodo(user, todoId)
}