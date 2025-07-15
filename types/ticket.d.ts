interface ITicket extends Document {
  phoneNumber: string;
  message: string;
  status: string;
  createdAt: Date;
}
