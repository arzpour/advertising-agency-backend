import { Router } from "express";
import asyncHandler from "../utils/async-handler";
import {
  addTicket,
  getTicketById,
  getTickets,
  getTicketsByPhone,
} from "../controllers/ticket-controller";
import validator from "../validations/validator";
import ticketValidationSchema from "../validations/ticket-validation";

const router = Router();

router.get("/", asyncHandler(getTickets));
router.get("/:id", asyncHandler(getTicketById));
router.get("/phone/:phoneNumber", asyncHandler(getTicketsByPhone));
router.post("/", validator(ticketValidationSchema), asyncHandler(addTicket));
