import { Schema, model, Document } from "mongoose";

export interface ITicket extends Document {
  userId: string;
  phoneNumber: string;
  message: string;
  status: string;
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  userId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

const Ticket = model<ITicket>("ticket", ticketSchema);

export default Ticket;
