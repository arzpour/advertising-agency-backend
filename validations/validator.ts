import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { ObjectSchema } from "joi";

const validator =
  (validationSchema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = validationSchema.validate(req.body);

    if (error) {
      return next(new AppError(400, error.message));
    }

    next();
  };

export default validator;
