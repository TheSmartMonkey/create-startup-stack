import { logger } from '@libs/utils/logger';
import { Utils } from '@libs/utils/utils';
import * as dotenv from 'dotenv';
import mongoose, { Mongoose } from 'mongoose';

dotenv.config();

export let mongooseConnection: Mongoose;

export class MongooseAdapter {
  static async connect(): Promise<void> {
    try {
      if (mongooseConnection) return;

      logger.info('Connecting to mongodb with mongoose...');
      mongoose.set('strictQuery', false);
      const url = Utils.getAnyByStageType({
        prod: `mongodb+srv://${process.env.MONGODB_USERNAME_PROD}:${process.env.MONGODB_PWD_PROD}@${process.env.ATLAS_DB_URL_PROD}/${process.env.MONGODB_NAME_UMI_PROD}?retryWrites=true&w=majority`,
        dev: this.getDevOrCiDbUrl(),
      });
      mongooseConnection = await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('Connected to mongodb with mongoose !');
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }

  static getDevOrCiDbUrl(): string {
    const atlasDbUrl = process.env.NODE_ENV === 'ci' ? process.env.ATLAS_CI_DB_URL : process.env.ATLAS_DB_URL;
    const mongoUsername = process.env.NODE_ENV === 'ci' ? process.env.CI_DB_USERNAME : process.env.MONGODB_USERNAME;
    const mongoPassword = process.env.NODE_ENV === 'ci' ? process.env.CI_DB_PASSWORD : process.env.MONGODB_PWD + '$';
    const mongoDBName = 'umi-tests';
    return `mongodb+srv://${mongoUsername}:${mongoPassword}@${atlasDbUrl}/${mongoDBName}?retryWrites=true&w=majority`;
  }

  static async disconnect(): Promise<void> {
    if (!mongooseConnection) return;
    await mongooseConnection.disconnect();
  }
}
