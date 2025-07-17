import { model, Schema } from "mongoose";
import { ICategory } from "../types/category";

const categorySchema = new Schema<ICategory>({
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
    default: "categories-icons-default.png",
  },
});

const Category = model<ICategory>("category", categorySchema);

export default Category;
