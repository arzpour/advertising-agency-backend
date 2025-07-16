import { Router } from "express";
import asyncHandler from "../utils/async-handler";
import {
  addBlog,
  editBlogById,
  getBlogById,
  getBlogs,
  removeBlogById,
} from "../controllers/blog-controller";
import validator from "../validations/validator";
import blogValidationSchema from "../validations/blog-validation";
import { uploadImages } from "../utils/upload-images";

const router = Router();

router.get("/", asyncHandler(getBlogs));
router.get("/:id", asyncHandler(getBlogById));

router.post(
  "/",
  uploadImages,
  validator(blogValidationSchema),
  asyncHandler(addBlog)
);

router.patch(
  "/:id",
  uploadImages,
  validator(blogValidationSchema),
  asyncHandler(editBlogById)
);

router.delete("/:id", asyncHandler(removeBlogById));
