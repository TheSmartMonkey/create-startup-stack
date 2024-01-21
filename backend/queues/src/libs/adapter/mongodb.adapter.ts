import { logger } from '@libs/utils/logger';
import { Utils } from '@libs/utils/utils';
import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';

dotenv.config();

export let mongoDbConnection: MongoClient;
export let mongoDbInstance: Db;
const mongoDbTestName = 'umi-tests';

export class MongoDbAdapter {
  static async connect(): Promise<void> {
    try {
      if (mongoDbConnection && mongoDbInstance) return;

      logger.info('Connecting to mongodb with MongoClient...');
      const url = Utils.getAnyByStageType({
        prod: `mongodb+srv://${process.env.MONGODB_USERNAME_PROD}:${process.env.MONGODB_PWD_PROD}@${process.env.ATLAS_DB_URL_PROD}/${process.env.MONGODB_NAME_UMI_PROD}?retryWrites=true&w=majority`,
        dev: this.getDevOrCiDbUrl(),
      });
      mongoDbConnection = await MongoClient.connect(url);
      logger.info('Connected to mongodb with MongoClient !');
      logger.info('Getting the database...');
      mongoDbInstance = mongoDbConnection.db(Utils.getAnyByStageType({ prod: process.env.MONGODB_NAME_UMI_PROD, dev: mongoDbTestName }));
      logger.info('Getting the database done !');
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }

  static getDevOrCiDbUrl(): string {
    const atlasDbUrl = process.env.NODE_ENV === 'ci' ? process.env.ATLAS_CI_DB_URL : process.env.ATLAS_DB_URL;
    const mongoUsername = process.env.NODE_ENV === 'ci' ? process.env.CI_DB_USERNAME : process.env.MONGODB_USERNAME;
    const mongoPassword = process.env.NODE_ENV === 'ci' ? process.env.CI_DB_PASSWORD : process.env.MONGODB_PWD + '$';
    return `mongodb+srv://${mongoUsername}:${mongoPassword}@${atlasDbUrl}/${mongoDbTestName}?retryWrites=true&w=majority`;
  }

  static async disconnect(): Promise<void> {
    if (!mongoDbConnection) return;
    await mongoDbConnection.close();
  }
}
