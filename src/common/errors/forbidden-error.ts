import { CustomError } from './custom-error';

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
