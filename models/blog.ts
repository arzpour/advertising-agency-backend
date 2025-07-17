import { Schema, model } from "mongoose";
import { IBlog } from "../types/blog";

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    description: String,
    thumbnail: { type: String, required: true },
    images: { type: [String] },
  },
  {
    timestamps: true,
  }
);

const Blog = model<IBlog>("blog", blogSchema);

export default Blog;
