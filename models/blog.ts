import { Schema, model } from "mongoose";

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  description: String,
  thumbnail: { type: String, required: true },
  images: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Blog = model<IBlog>("blog", blogSchema);

export default Blog;
