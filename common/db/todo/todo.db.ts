import { randomUUID } from 'crypto';
import { log } from '../../helpers/logger';
import { CreateTodoDao, GetTodoByIdDao, TodoDao } from './todo.dao';

export async function getAllTodosDb(): Promise<TodoDao[]> {
  return [
    {
      id: randomUUID(),
      title: 'todo1',
      step: 1,
    },
    {
      id: randomUUID(),
      title: 'todo2',
      step: 1,
    },
  ];
}

export async function getTodoByIdDb({ data }: { data: GetTodoByIdDao }): Promise<TodoDao> {
  const id = '1234';
  if (data.todoId !== id) return {} as TodoDao;
  const todo = {
    id,
    title: 'todo1',
    step: 1,
  };
  log.info({ todo, originalUrl: process.env.originalUrl });
  return todo;
}

export async function createTodoDb({ data }: { data: CreateTodoDao }): Promise<TodoDao> {
  return {
    id: randomUUID(),
    ...data,
  };
}
