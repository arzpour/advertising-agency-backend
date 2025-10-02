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
import { constants, access, unlink } from "node:fs/promises";
import { join } from "node:path";
import { IQueryString, IUploadFiles } from "../types/global";
import { IProject } from "../types/project";

const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectModel = new ApiFeatures<IProject>(
      Project.find({}),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter();

    const projects = await projectModel.getQuery().sort({ order: 1 });

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

    const isProjectExist = await Project.exists({ name: projectName });

    if (isProjectExist) {
      return next(new AppError(409, "project title already exists"));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new AppError(404, `category: ${categoryId} not found`));
    }

    const lastProject = await Project.findOne().sort("-order").exec();
    const nextOrder = lastProject ? lastProject.order + 1 : 1;

    const project = await Project.create({
      name: projectName,
      description,
      category: categoryId,
      order: nextOrder,
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

const editProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: projectId } = req.params;

    const {
      name: projectName = null,
      description = null,
      category: categoryId = null,
    } = req.body;

    const project = await Project.findById(projectId).populate("category");

    if (!project) {
      return next(new AppError(404, `project: ${projectId} not found`));
    }

    const duplicateProject = await Project.findOne({ name: projectName });

    if (duplicateProject && duplicateProject.name !== project.name) {
      return next(
        new AppError(
          409,
          "project name is already exists. choose a different project name"
        )
      );
    }

    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError(404, `category: ${categoryId} not found`));
      }
    }

    category = category ?? project.category;

    if (!category) {
      return next(new AppError(400, `category not provided or found`));
    }

    const hasNewFiles = req.files && Object.keys(req.files).length > 0;

    let thumbnail = null;
    if (hasNewFiles) {
      thumbnail = await resizeThumbnail(
        "projects",
        projectId,
        req.files as IUploadFiles
      );

      if (
        thumbnail &&
        project.thumbnail &&
        project.thumbnail !== thumbnailsDefault("projects")
      ) {
        try {
          await access(
            join(
              __dirname,
              "../public/images/projects/thumbnails",
              project.thumbnail
            ),
            constants.F_OK
          );
          await unlink(
            join(
              __dirname,
              "../public/images/projects/thumbnails",
              project.thumbnail
            )
          );
        } catch {}
      }
    }

    let images: string[] = [];
    if (hasNewFiles) {
      images = await resizeImages(
        "projects",
        projectId,
        req.files as IUploadFiles
      );

      const defaultImages = imagesDefault("projects");
      const hasDefaultImages = defaultImages.every((img) =>
        project.images.includes(img)
      );

      if (!hasDefaultImages) {
        for (const image of project.images) {
          try {
            await access(
              join(__dirname, "../public/images/projects/images", image),
              constants.F_OK
            );
            await unlink(
              join(__dirname, "../public/images/projects/images", image)
            );
          } catch {}
        }
      }
    }

    project.category = category._id;
    project.name = projectName ?? project.name;
    project.description = description ?? project.description;
    project.thumbnail = thumbnail ?? project.thumbnail;
    project.images = images.length > 0 ? images : project.images;

    await project.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: { project },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const removeProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return next(new AppError(404, `project: ${projectId} not found`));
    }

    if (project.thumbnail !== thumbnailsDefault("project")) {
      await access(
        join(
          __dirname,
          "../public/images/projects/thumbnails",
          project?.thumbnail
        ),
        constants.F_OK
      );
      await unlink(
        join(
          __dirname,
          "../public/images/projects/thumbnails",
          project?.thumbnail
        )
      );
    }

    const defaultImages = imagesDefault("projects");
    const hasDefaultImages = defaultImages.every((img) =>
      project.images.includes(img)
    );

    if (!hasDefaultImages) {
      for (const image of project.images) {
        await access(
          join(__dirname, "../public/images/projects/images", image),
          constants.F_OK
        );
        await unlink(
          join(__dirname, "../public/images/projects/images", image)
        );
      }
    }

    res.status(200).json({
      status: "success",
      data: { project },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const editOrderProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return next(new AppError(400, "Invalid orders format"));
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Project.bulkWrite(bulkOps);
    const updated = await Project.find().sort({ order: 1 });

    res.status(200).json({
      status: "success",
      message: "Orders updated successfully",
      data: { projects: updated },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProjects,
  getProjectById,
  addProject,
  editProjectById,
  removeProjectById,
  editOrderProjects,
};
