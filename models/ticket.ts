import { Schema, model } from "mongoose";

const ticketSchema = new Schema<ITicket>({
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

const Ticket = model<ITicket>("ticket", ticketSchema);

export default Ticket;
