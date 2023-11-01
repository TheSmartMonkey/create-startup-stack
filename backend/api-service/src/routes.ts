import { BASE_URL } from '@helpers/constants';
import { Router } from 'express';

// Routes Imports
import helloRoutes from '@api/hello/routes';
import todoRoutes from '@api/todo/routes';

const router = Router();

// Global routes
router.use(`${BASE_URL}/hello`, helloRoutes);
router.use(`${BASE_URL}/todo`, todoRoutes);

export default router;
