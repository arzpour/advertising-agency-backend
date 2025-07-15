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
    const { title: blogTitle, description } = req.body;

    const isBlogExist = await Blog.exists({ blogTitle });

    if (!!isBlogExist) {
      return next(new AppError(409, "blog title already exists"));
    }

    const blog = await Blog.create({
      title: blogTitle,
      description,
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

    const { title: blogTitle = null, description = null } = req.body;

    const blog = await Blog.findById(blogId).populate("category");

    if (!blog) {
      return next(new AppError(404, `blog: ${blogId} not found`));
    }

    const duplicateBlog = await Blog.findOne({ title: blogTitle });

    if (!!duplicateBlog && duplicateBlog?.title !== blog?.title) {
      return next(
        new AppError(
          409,
          "blog title is already exists. choose a different blog title"
        )
      );
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

    blog.title = blogTitle ?? blog.title;
    blog.description = description ?? blog.description;
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
