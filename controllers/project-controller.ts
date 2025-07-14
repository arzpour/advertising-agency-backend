import { NextFunction, Request, Response } from "express";
import Project from "../models/project";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";

const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      return next(new AppError(404, `project ${projectId} not found`));
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

export { getProjects, getProjectById };
