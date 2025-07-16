import { Router } from "express";
import {
  addProject,
  editProjectById,
  getProjectById,
  getProjects,
  removeProjectById,
} from "../controllers/project-controller";
import { uploadImages } from "../utils/upload-images";
import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";
import projectValidationSchema from "../validations/project-validation";

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
  "/:id",
  uploadImages,
  validator(projectValidationSchema),
  asyncHandler(editProjectById)
);
router.delete("/:id", asyncHandler(removeProjectById));

export default router;
