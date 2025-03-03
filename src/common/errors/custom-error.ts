import { HttpError } from './http-error';

export abstract class CustomError extends HttpError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
} 