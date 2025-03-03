import { CustomError } from './custom-error';

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Not authorized') {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
} 