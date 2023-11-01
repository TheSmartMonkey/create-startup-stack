import { TodoDao } from '@db/todo/todo.dao';
import { createTodoDb } from '@db/todo/todo.db';
import { UserDao } from '@db/user/user.dao';
import { CreateTodoDto } from '../dtos/create-todo.dto';

export async function createTodoWithUserEmailAsTitleService(createTodoDto: CreateTodoDto, userDao: UserDao): Promise<TodoDao> {
  return createTodoDb({ ...createTodoDto, title: userDao.email });
}
