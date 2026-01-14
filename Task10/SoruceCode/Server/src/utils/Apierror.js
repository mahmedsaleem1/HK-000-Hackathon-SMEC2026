class APIError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    silent = false, // If true, don't log to console (for expected errors like token expiration)
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.data = null;
    this.success = false;
    this.statusCode = statusCode;
    this.errors = errors;
    this.silent = silent;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
      // this will create a stack trace for this error and exclude the constructor call from the stack trace
    }
  }
}
export { APIError };
