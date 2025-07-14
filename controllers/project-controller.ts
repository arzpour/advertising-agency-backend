import { NextFunction, Request, Response } from "express";
import Project from "../models/project";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";
import Category from "../models/category";
import {
  imagesDefault,
  resizeImages,
  resizeThumbnail,
  thumbnailsDefault,
} from "../utils/upload-images";

const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectModel = new ApiFeatures<IProject>(
      Project.find({}),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter()
      .sort();

    const projects = projectModel.getQuery();

    const { page = 1, limit = 10 } = req.query;

    const totalModels = new ApiFeatures<IProject>(
      Project.find(),
      req.query as IQueryString
    ).filter();

    const total = await totalModels.getQuery();

    const totalPages = Math.ceil(total.length / Number(limit));

    res.status(200).json({
      status: "success",
      page: Number(page),
      per_page: Number(limit),
      total: total.length,
      total_pages: totalPages,
      data: { projects },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: projectId } = req.params;

  try {
    const projectById = await Project.findById(projectId);

    if (!projectById) {
      return next(new AppError(404, `project: ${projectId} not found`));
    }

    res.status(200).json({
      status: "success",
      data: { projectById },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const addProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name: projectName, description, category: categoryId } = req.body;

    const isProjectExist = await Project.exists({ projectName });

    if (!!isProjectExist) {
      return next(new AppError(409, "project title already exists"));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new AppError(404, `category: ${categoryId} not found`));
    }

    const project = await Project.create({
      name: projectName,
      description,
      category: categoryId,
    });

    const thumbnail = await resizeThumbnail(
      "projects",
      project.id,
      req.files as IUploadFiles
    );

    const images = await resizeImages(
      "projects",
      project.id,
      req.files as IUploadFiles
    );

    project.thumbnail = thumbnail ?? thumbnailsDefault("projects");
    project.images = images.length ? images : imagesDefault("projects");

    await project.save({ validateModifiedOnly: true });

    res.status(201).json({
      status: "success",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export { getProjects, getProjectById, addProject };
