import { controllerMiddleware } from '@middlewares/controller.middleware';
import { dtoValidationMiddleware } from '@middlewares/dto-validation.middleware';
import { Router } from 'express';
import { HelloDto } from './dtos/hello.dto';
import { helloService } from './services/hello/hello.service';

const router = Router();

router.get('/message/:message', dtoValidationMiddleware(HelloDto), controllerMiddleware(helloService));

export default router;
