import { model, Schema } from "mongoose";
import { ICategory } from "../types/category";

const categorySchema = new Schema<ICategory>(
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
      default: "categories-icons-default.png",
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

const Category = model<ICategory>("category", categorySchema);

export default Category;
