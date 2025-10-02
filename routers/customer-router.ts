import { Router } from "express";

import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";

import editOrdersValidationSchema from "../validations/global-validation";
import {
  addCustomer,
  editCustomerById,
  editOrderCustomers,
  getAllCustomers,
  getCustomerById,
  removeCustomerById,
  uploadCustomerIcon,
} from "../controllers/customer-controller";
import {
  addCustomerValidationSchema,
  editCustomerValidationSchema,
} from "../validations/customer-validation";

const router = Router();

router.get("/", asyncHandler(getAllCustomers));

router.post(
  "/",
  uploadCustomerIcon,
  validator(addCustomerValidationSchema),
  asyncHandler(addCustomer)
);

router.get("/:id", asyncHandler(getCustomerById));

router.patch(
  "/editOrder",
  validator(editOrdersValidationSchema),
  asyncHandler(editOrderCustomers)
);
router.patch(
  "/:id",
  uploadCustomerIcon,
  validator(editCustomerValidationSchema),
  asyncHandler(editCustomerById)
);

router.delete("/:id", asyncHandler(removeCustomerById));

export default router;
