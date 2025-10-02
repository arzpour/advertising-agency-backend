import { model, Schema } from "mongoose";
import { ICustomer } from "../types/customer";

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "name is required"],
    },
    icon: {
      type: String,
      trim: true,
      required: [true, "icon is required"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = model<ICustomer>("customer", customerSchema);

export default Customer;
