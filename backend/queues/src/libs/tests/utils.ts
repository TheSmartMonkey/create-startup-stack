import { mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { logger } from '@libs/utils/logger';
import { DB_COLLECTIONS } from '@models/db.model';
import { APIGatewayProxyResult } from 'aws-lambda';
import { CollectionInfo } from 'mongodb';
import mongoose from 'mongoose';

export async function cleanupIntegrationTestsDropMongoDbCollections(): Promise<void> {
  await MongooseAdapter.connect();
  const collections = await mongoose.connection.db.listCollections().toArray();
  logger.info({ collections });
  await removeAllCollectionsWithYourDevName(collections);
  await MongooseAdapter.disconnect();
}

async function removeAllCollectionsWithYourDevName(collections: CollectionInfo[]): Promise<void> {
  const stage = process.env.AWS_STAGE;
  if (!stage) {
    logger.error('AWS_STAGE is undefined');
    return;
  }

  for (const collection of collections) {
    const isYourCollection = collection?.name?.includes(stage);
    if (!isYourCollection) continue;
    await mongoose.connection.db.dropCollection(collection?.name);
  }
}

export function getDataFromJSONResponse<T>(response: APIGatewayProxyResult): T {
  return JSON.parse(response.body).data;
}

export function getMessageFromJSONResponse(response: APIGatewayProxyResult): string {
  return JSON.parse(response.body).message;
}

export async function findPros(): Promise<any[]> {
  return await mongoDbInstance.collection(DB_COLLECTIONS.Pros).find().toArray();
}

export async function getPro(email: string): Promise<any> {
  return await mongoDbInstance.collection(DB_COLLECTIONS.Pros).findOne({ email });
}
