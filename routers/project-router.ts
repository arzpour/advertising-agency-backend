import { Router } from "express";
import {
  addProject,
  editOrderProjects,
  editProjectById,
  getProjectById,
  getProjects,
  removeProjectById,
} from "../controllers/project-controller";
import { uploadImages } from "../utils/upload-images";
import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";
import {
  projectValidationSchema,
  editOrdersValidationSchema,
} from "../validations/project-validation";

const router = Router();

router.get("/", asyncHandler(getProjects));
router.post(
  "/",
  uploadImages,
  validator(projectValidationSchema),
  asyncHandler(addProject)
);
router.get("/:id", asyncHandler(getProjectById));
router.patch(
  "/editOrder",
  validator(editOrdersValidationSchema),
  asyncHandler(editOrderProjects)
);
router.patch(
  "/:id",
  uploadImages,
  validator(projectValidationSchema),
  asyncHandler(editProjectById)
);
router.delete("/:id", asyncHandler(removeProjectById));

export default router;
