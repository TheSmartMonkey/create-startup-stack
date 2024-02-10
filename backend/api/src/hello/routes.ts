import { controller } from '@middlewares/controller.middleware';
import { dtoValidation } from '@middlewares/dto-validation.middleware';
import { Router } from 'express';
import { HelloQueueDto } from './dtos/hello-queue.dto';
import { HelloDto } from './dtos/hello.dto';
import { helloQueueService } from './services/hello-queue.service';
import { helloService } from './services/hello/hello.service';

const router = Router();

router.get('/message/:message', dtoValidation(HelloDto), controller(helloService));
router.get('/queue/message/:message', dtoValidation(HelloQueueDto), controller(helloQueueService));

export default router;
