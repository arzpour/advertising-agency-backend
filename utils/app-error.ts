class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(statusCode: number, errorMessage: string) {
    super(errorMessage);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("5") ? "error" : "failed";

    Object.setPrototypeOf(this, AppError.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
