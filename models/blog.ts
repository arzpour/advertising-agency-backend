import { Schema, Document, model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  time: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  description: String,
  thumbnail: { type: String, required: true },
  images: { type: [String] },
  time: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Blog = model<IBlog>("blog", blogSchema);

export default Blog;
