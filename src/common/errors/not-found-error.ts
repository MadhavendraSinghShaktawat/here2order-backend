import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
