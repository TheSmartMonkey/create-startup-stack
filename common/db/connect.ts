import mongoose, { Mongoose } from 'mongoose';
import { log } from '../helpers/logger';

export let mongoDbConnection: Mongoose;

export class MongoDbAdapter {
  static async connect(): Promise<Mongoose> {
    try {
      if (mongoDbConnection) return mongoDbConnection;

      log.info('Connecting to mongodb...');
      mongoose.set('strictQuery', false);
      const mongoDbUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.ATLAS_DB_URL}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`;
      mongoDbConnection = await mongoose.connect(mongoDbUri, {
        serverSelectionTimeoutMS: 5000,
      });
      log.info('Connected to mongodb !');
      return mongoDbConnection;
    } catch (error: any) {
      log.error(error.message);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (!mongoDbConnection) return;
    await mongoDbConnection.disconnect();
  }
}
