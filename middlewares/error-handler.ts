import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status,
    message: err.message || "Something went wrong!",
  });
};

export default globalErrorHandler;
