import { Request } from 'express';

export type HttpResponse<T> = {
  statusCode: number;
  body: {
    message: string;
    data?: T;
    error?: any;
  };
};

export type AwsHttpResponse = {
  statusCode: number;
  body: string;
};

export type ExpressRequest<T> = Request & { data: T };
