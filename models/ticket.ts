import { Schema, model } from "mongoose";
import { ITicket } from "../types/ticket";

const ticketSchema = new Schema<ITicket>(
  {
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "sent" },
  },
  {
    timestamps: true,
  }
);

const Ticket = model<ITicket>("ticket", ticketSchema);

export default Ticket;
