import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
