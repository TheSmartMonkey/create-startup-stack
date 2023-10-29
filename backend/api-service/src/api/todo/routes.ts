import { createTodoDb, getAllTodosDb, getTodoByIdDb } from '@db/todo/todo.db';
import { controllerMiddleware } from '@middlewares/controller.middleware';
import { dtoValidationMiddleware } from '@middlewares/dto-validation.middleware';
import { Router } from 'express';
import { GetTodoByIdTodoDto } from './dtos/get-todo-by-id.dto';
import { CreateTodoDto } from './dtos/create-todo.dto';

const router = Router();

router.get('/', controllerMiddleware(getAllTodosDb));
router.get('/todoId/:todoId', dtoValidationMiddleware(GetTodoByIdTodoDto), controllerMiddleware(getTodoByIdDb));
router.post('/', dtoValidationMiddleware(CreateTodoDto), controllerMiddleware(createTodoDb));

export default router;
