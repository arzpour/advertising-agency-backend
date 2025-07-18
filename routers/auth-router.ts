import { Router } from "express";
import asyncHandler from "../utils/async-handler";
import validator from "../validations/validator";
import {
  userLoginValidationSchema,
  userSignupValidationSchema,
} from "../validations/auth-validation";
import {
  authenticateRefreshToken,
  generateAccessToken,
  login,
  logout,
  protect,
  signup,
} from "../controllers/auth-controller";

const router = Router();

router.post(
  "/login",
  validator(userLoginValidationSchema),
  asyncHandler(login)
);

router.post(
  "/signup",
  validator(userSignupValidationSchema),
  asyncHandler(signup)
);

router.get("/logout", protect, asyncHandler(logout));

router.post(
  "/token",
  asyncHandler(authenticateRefreshToken),
  generateAccessToken
);
export default router;
