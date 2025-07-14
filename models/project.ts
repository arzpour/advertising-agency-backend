import { Schema, model } from "mongoose";

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, "name is required"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "category is required"],
  },
  thumbnail: {
    type: String,
    trim: true,
    default: "projects-thumbnails-default.jpeg",
  },
  images: {
    type: [String],
    trim: true,
    default: ["projects-images-default.jpeg"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Project = model<IProject>("project", projectSchema);

export default Project;
