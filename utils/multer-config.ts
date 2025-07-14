import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "./app-error";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const error = new AppError(400, "Not an image, upload only images");
    cb(error as unknown as null, false);
  }
};

const multerUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export default multerUpload;
