import { CustomError } from './custom-error';

export class RequestTimeoutError extends CustomError {
  constructor(message: string = 'Request timeout') {
    super(408, message);
    Object.setPrototypeOf(this, RequestTimeoutError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
} 