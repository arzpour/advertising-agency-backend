import { model, Schema } from "mongoose";
import { IService } from "../types/service";

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "name is required"],
    },
    description: String,
    icon: {
      type: String,
      trim: true,
      default: "services-icons-default.png",
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

const Services = model<IService>("service", serviceSchema);

export default Services;
