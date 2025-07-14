import { Schema, model } from "mongoose";

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: String,
  category: String,
  url: String,
  thumbnail: { type: String, required: true },
  images: { type: [String] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Project = model<IProject>("project", projectSchema);

export default Project;
