import { BASE_URL } from '@helpers/constants';
import { logger } from '@libs/logger';
import { errorHandlerMiddleware } from '@middlewares/error.middleware';
import { sendJsonMiddleware } from '@middlewares/send-json.middleware';
import { HttpError } from '@models/global/http-error.model';
import dotenv from 'dotenv';
import express from 'express';
import serverless from 'serverless-http';
import routes from './routes';

// Initialize configuration
dotenv.config();
const app = express();
app.use(express.json());

// Global routes
app.use('/', routes);

// Middlewares
app.use(function (req, res, next) {
  if (!req.route) return next(new HttpError(404, 'ROUTE_DOES_NOT_EXIST'));
  next();
});
app.use(sendJsonMiddleware);
app.use(errorHandlerMiddleware);

// Launch
if (process.env.LOCAL === 'true') {
  const port = process.env.PORT ?? 3001;
  app.listen(port, () => logger.info(`App listening at http://localhost:${port}${BASE_URL}`));
}
module.exports.handler = serverless(app);
