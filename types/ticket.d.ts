export interface ITicket extends Document {
  phoneNumber: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}
