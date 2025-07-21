import { Schema, model } from "mongoose";
import { IBlog } from "../types/blog";

const blogSchema = new Schema<IBlog>(
  {
    name: { type: String, required: true },
    description: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    thumbnail: {
      type: String,
      trim: true,
      default: "blogs-thumbnails-default.jpeg",
    },
    images: {
      type: [String],
      trim: true,
      default: ["blogs-images-default.jpeg"],
    },
  },
  {
    timestamps: true,
  }
);

const Blog = model<IBlog>("blog", blogSchema);

export default Blog;
