import { Schema, model } from "mongoose";
import { ITicket } from "../types/ticket";

const ticketSchema = new Schema<ITicket>(
  {
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Ticket = model<ITicket>("ticket", ticketSchema);

export default Ticket;
