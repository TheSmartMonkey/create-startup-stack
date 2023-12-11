import { createTodoDb, getAllTodosDb, getTodoByIdDb } from '@db/todo/todo.db';
import { controller } from '@middlewares/controller.middleware';
import { dtoValidation } from '@middlewares/dto-validation.middleware';
import { requireAuthToken } from '@middlewares/require-auth-token.middleware';
import { Router } from 'express';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { GetTodoByIdTodoDto } from './dtos/get-todo-by-id.dto';
import { createTodoWithUserEmailAsTitleService } from './services/create-todo-user-email.service';

const router = Router();

router.get('/', requireAuthToken, controller(getAllTodosDb));
router.get('/todoId/:todoId', requireAuthToken, dtoValidation(GetTodoByIdTodoDto), controller(getTodoByIdDb));
router.post('/', requireAuthToken, dtoValidation(CreateTodoDto), controller(createTodoDb));
router.post('/user-email', requireAuthToken, dtoValidation(CreateTodoDto), controller(createTodoWithUserEmailAsTitleService));

export default router;
