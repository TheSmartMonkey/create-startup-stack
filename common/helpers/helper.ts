import { AwsHttpResponse, HttpResponse } from '@models/global/http.model';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

export function formatHttpResponse<T>(response: HttpResponse<T>): AwsHttpResponse {
  return {
    statusCode: response.statusCode,
    body: JSON.stringify(response.body),
  };
}

export function generateUniqueId(): string {
  return randomUUID();
}

export function generateMongooseUniqueId(): Types.ObjectId {
  return new Types.ObjectId();
}

/**
 * For [1,2,3] [2,3] it will yield [1]. On the other hand, for [1,2,3] [2,3,5] will return the same thing
 */
export function getDifferenceOfTwoLists<T>(list1: T[], list2: T[]): T[] {
  return list1.filter((l) => !list2.includes(l));
}

export function getAnyByStageType<T>({ prod, dev }: { prod: T; dev: T }): T {
  return process.env.AWS_STAGE?.includes('prod') ? prod : dev;
}
