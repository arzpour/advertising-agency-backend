import { Router } from "express";

import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";
import {
  addCategory,
  editCategoryById,
  getAllCategories,
  getCategoryById,
  removeCategoryById,
  uploadCategoryIcon,
} from "../controllers/category-controller";
import {
  addCategoryValidationSchema,
  editCategoryValidationSchema,
} from "../validations/category-validation";

const router = Router();

router.get("/", asyncHandler(getAllCategories));

router.post(
  "/",
  uploadCategoryIcon,
  validator(addCategoryValidationSchema),
  asyncHandler(addCategory)
);

router.get("/:id", asyncHandler(getCategoryById));

router.patch(
  "/:id",
  uploadCategoryIcon,
  validator(editCategoryValidationSchema),
  asyncHandler(editCategoryById)
);

router.delete("/:id", asyncHandler(removeCategoryById));

export default router;
