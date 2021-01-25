import * as uuid from 'uuid'

import { TodoAccess } from "../dataLayer/todoAccess";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess()

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
        done: false
    })    
}

export async function getTodoItems(user: string): Promise<TodoItem[]> {
    return await todoAccess.GetAllTodos(user);
}

export async function deleteTodoItem(user: string, todoId: string): Promise<boolean> {
    return await todoAccess.DeleteTodo(user, todoId)
}

export async function updateTodoItem(user: string, todoId: string, update: UpdateTodoRequest): Promise<boolean> {
    return await todoAccess.UpdateTodo(user, todoId, update)
}

export async function updateAttachmentUrl(user: string, todoId: string): Promise<string> {
    return await todoAccess.UpdateAttachmentUrl(user, todoId)
}