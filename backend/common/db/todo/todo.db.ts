import { randomUUID } from 'crypto';
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

export async function getTodoByIdDb(getTodoByIdDao: GetTodoByIdDao): Promise<TodoDao> {
  const id = '1234';
  if (getTodoByIdDao.todoId !== id) return {} as TodoDao;
  return {
    id,
    title: 'todo1',
    step: 1,
  };
}

export async function createTodoDb(createTodoDao: CreateTodoDao): Promise<TodoDao> {
  return {
    id: randomUUID(),
    ...createTodoDao,
  };
}
