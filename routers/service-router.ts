import { Router } from "express";

import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";

import editOrdersValidationSchema from "../validations/global-validation";
import {
  addService,removeServiceById, 
  editOrderServices,
  editServiceById,
  getAllServices,
  getServiceById,
  uploadServicesIcon,
} from "../controllers/service-controller";
import {
  addServiceValidationSchema,
  editServiceValidationSchema,
} from "../validations/service-validation";

const router = Router();

router.get("/", asyncHandler(getAllServices));

router.post(
  "/",
  uploadServicesIcon,
  validator(addServiceValidationSchema),
  asyncHandler(addService)
);

router.get("/:id", asyncHandler(getServiceById));

router.patch(
  "/editOrder",
  validator(editOrdersValidationSchema),
  asyncHandler(editOrderServices)
);
router.patch(
  "/:id",
  uploadServicesIcon,
  validator(editServiceValidationSchema),
  asyncHandler(editServiceById)
);

router.delete("/:id", asyncHandler(removeServiceById));

export default router;
