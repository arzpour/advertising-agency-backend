import { Schema, model } from "mongoose";
import { IProject } from "../types/project";

const projectSchema = new Schema<IProject>(
  {
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
      ref: "category",
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
  },
  {
    timestamps: true,
  }
);

const Project = model<IProject>("project", projectSchema);

export default Project;
