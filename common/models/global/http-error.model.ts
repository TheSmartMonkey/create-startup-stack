import { HttpCodes } from "./http-codes.model";

export class HttpError {
  statusCode: HttpCodes;
  message: Uppercase<string>;

  constructor(statusCode: HttpCodes, message: Uppercase<string>) {
    this.statusCode = statusCode;
    this.message = message;
  }
}
