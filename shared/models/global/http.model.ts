import { HttpCodes } from './http-codes.model';

export type HttpResponse<T> = {
  statusCode: HttpCodes;
  body: {
    message: string;
    originalUrl: string;
    data?: T;
    error?: any;
  };
};

export type AwsHttpResponse = {
  statusCode: HttpCodes;
  body: string;
};
