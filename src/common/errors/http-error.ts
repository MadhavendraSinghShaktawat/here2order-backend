/**
 * Base class for HTTP errors with status codes
 * Extends the built-in Error class with HTTP-specific properties
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Creates a new HttpError
   * @param statusCode HTTP status code
   * @param message Error message
   * @param isOperational Whether this is an operational error (true) or a programming error (false)
   */
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, HttpError.prototype);
    
    // Set the name to the class name
    this.name = this.constructor.name;
  }
} 