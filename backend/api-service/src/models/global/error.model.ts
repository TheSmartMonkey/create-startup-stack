import { HttpStatus } from "aws-sdk/clients/lambda";

export class HttpError {
  statusCode: HttpStatus;
  message: Uppercase<string>;

  constructor(statusCode: HttpStatus, message: Uppercase<string>) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
