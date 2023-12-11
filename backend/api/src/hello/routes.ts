import { controller } from '@middlewares/controller.middleware';
import { dtoValidation } from '@middlewares/dto-validation.middleware';
import { Router } from 'express';
import { HelloDto } from './dtos/hello.dto';
import { helloService } from './services/hello/hello.service';

const router = Router();

router.get('/message/:message', dtoValidation(HelloDto), controller(helloService));

export default router;
