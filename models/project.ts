import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  url: string;
  thumbnails: string;
  images: string[];
  createdAt: Date;
  updateAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: String,
  category: String,
  url: String,
  thumbnails: { type: String, required: true },
  images: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

const Project = model<IProject>("project", projectSchema);

export default Project;
