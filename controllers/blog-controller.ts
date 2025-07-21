import { NextFunction, Request, Response } from "express";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";
import {
  imagesDefault,
  resizeImages,
  resizeThumbnail,
  thumbnailsDefault,
} from "../utils/upload-images";
import { constants, access, unlink } from "node:fs/promises";
import { join } from "node:path";
import Blog from "../models/blog";
import { IBlog } from "../types/blog";
import { IQueryString, IUploadFiles } from "../types/global";
import Category from "../models/category";

const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogModel = new ApiFeatures<IBlog>(
      Blog.find({}),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter()
      .sort();

    const blogs = blogModel.getQuery();

    const { page = 1, limit = 10 } = req.query;

    const totalModels = new ApiFeatures<IBlog>(
      Blog.find(),
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
      data: { blogs },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  const { id: blogId } = req.params;

  try {
    const blogById = await Blog.findById(blogId);

    if (!blogById) {
      return next(new AppError(404, `blog: ${blogId} not found`));
    }

    res.status(200).json({
      status: "success",
      data: { blogById },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const addBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name: blogName, description, category: categoryId } = req.body;

    const isBlogExist = await Blog.exists({ blogName });

    if (!!isBlogExist) {
      return next(new AppError(409, "blog name already exists"));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new AppError(404, `category: ${categoryId} not found`));
    }

    const blog = await Blog.create({
      name: blogName,
      description,
      category: categoryId,
    });

    const thumbnail = await resizeThumbnail(
      "blogs",
      blog.id,
      req.files as IUploadFiles
    );

    const images = await resizeImages(
      "blogs",
      blog.id,
      req.files as IUploadFiles
    );

    blog.thumbnail = thumbnail ?? thumbnailsDefault("blogs");
    blog.images = images.length ? images : imagesDefault("blogs");

    await blog.save({ validateModifiedOnly: true });

    res.status(201).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    next(error);
  }
};

const editBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: blogId } = req.params;

    const {
      name: blogName = null,
      description = null,
      category: categoryId = null,
    } = req.body;

    const blog = await Blog.findById(blogId).populate("category");

    if (!blog) {
      return next(new AppError(404, `blog: ${blogId} not found`));
    }

    const duplicateBlog = await Blog.findOne({ name: blogName });

    if (!!duplicateBlog && duplicateBlog?.name !== blog?.name) {
      return next(
        new AppError(
          409,
          "blog name is already exists. choose a different blog name"
        )
      );
    }

    let category = await Category.findById(categoryId);

    if (!category && !!categoryId) {
      return next(new AppError(404, `category: ${categoryId} not found`));
    }

    category ??= blog?.category;

    if (!category) {
      return next(new AppError(400, `category not provided or found`));
    }

    const thumbnail = await resizeThumbnail(
      "blogs",
      blogId,
      req.files as IUploadFiles
    );

    if (!!thumbnail && blog?.thumbnail !== thumbnailsDefault("blogs")) {
      await access(
        join(__dirname, "../public/images/blogs/thumbnails", blog?.thumbnail),
        constants.F_OK
      );
      await unlink(
        join(__dirname, "../public/images/blogs/thumbnails", blog?.thumbnail)
      );
    }

    const images = await resizeImages(
      "blogs",
      blogId,
      req.files as IUploadFiles
    );

    const defaultImages = imagesDefault("blogs");
    const hasDefaultImages = defaultImages.every((img) =>
      blog.images.includes(img)
    );

    if (!hasDefaultImages) {
      for (const image of blog.images) {
        await access(
          join(__dirname, "../public/images/blogs/images", image),
          constants.F_OK
        );
        await unlink(join(__dirname, "../public/images/blogs/images", image));
      }
    }

    blog.name = blogName ?? blog.name;
    blog.description = description ?? blog.description;
    blog.category = category._id;
    blog.thumbnail = thumbnail ?? blog.thumbnail;
    blog.images = images.length ? images : blog.images;

    await blog.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const removeBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: blogId } = req.params;

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return next(new AppError(404, `blog: ${blogId} not found`));
    }

    if (blog.thumbnail !== thumbnailsDefault("blogs")) {
      await access(
        join(__dirname, "../public/images/blogs/thumbnails", blog?.thumbnail),
        constants.F_OK
      );
      await unlink(
        join(__dirname, "../public/images/blogs/thumbnails", blog?.thumbnail)
      );
    }

    const defaultImages = await imagesDefault("blogs");
    const hasDefaultImages = defaultImages.every((img) =>
      blog.images.includes(img)
    );

    if (!hasDefaultImages) {
      for (const image of blog.images) {
        await access(
          join(__dirname, "../public/images/blogs/images", image),
          constants.F_OK
        );
        await unlink(join(__dirname, "../public/images/blogs/images", image));
      }
    }

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

export { getBlogs, getBlogById, addBlog, editBlogById, removeBlogById };
