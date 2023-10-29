import { BASE_URL } from '@helpers/constants';
import { logger } from '@helpers/logger';
import { errorHandlerMiddleware } from '@middlewares/error.middleware';
import { sendJsonMiddleware } from '@middlewares/send-json.middleware';
import dotenv from 'dotenv';
import express from 'express';
import serverless from 'serverless-http';

// Routes
import helloRoutes from '@api/hello/routes';
import todoRoutes from '@api/todo/routes';

// Initialize configuration
dotenv.config();
const app = express();
app.use(express.json());

// Global routes
app.use(`${BASE_URL}/hello`, helloRoutes);
app.use(`${BASE_URL}/todo`, todoRoutes);

// Middlewares
app.use(errorHandlerMiddleware);
app.use(sendJsonMiddleware);

// Launch
if (process.env.LOCAL === 'true') {
  const port = process.env.PORT ?? 3001;
  app.listen(port, () => logger.info(`App listening at http://localhost:${port}${BASE_URL}`));
}
module.exports.handler = serverless(app);
