import { API_SERVICE_BASE_URL } from '@helpers/constants';
import { Router } from 'express';

// Routes Imports
import helloRoutes from '@api/hello/routes';
import todoRoutes from 'src/todo/routes';

const router = Router();

// Global routes
router.use(`${API_SERVICE_BASE_URL}/hello`, helloRoutes);
router.use(`${API_SERVICE_BASE_URL}/todo`, todoRoutes);

export default router;
