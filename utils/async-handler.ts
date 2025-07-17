import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = (
  asyncController: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>
): RequestHandler => {
  return (req, res, next) => {
    asyncController(req, res, next).catch(next);
  };
};

export default asyncHandler;
