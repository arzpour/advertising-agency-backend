import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = <T extends RequestHandler>(
  controller: (req: Request, res: Response, next: NextFunction) => ReturnType<T>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};

export default asyncHandler;
