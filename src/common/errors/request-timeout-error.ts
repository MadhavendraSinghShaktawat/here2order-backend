import { CustomError } from './custom-error';

export class RequestTimeoutError extends CustomError {
  statusCode = 408;

  constructor() {
    super('Request timeout');
    Object.setPrototypeOf(this, RequestTimeoutError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Request took too long to process' }];
  }
} 