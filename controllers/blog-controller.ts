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
      .filter();

    const blogs = await blogModel.getQuery().sort({ order: 1 });

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

    const isBlogExist = await Blog.exists({ name: blogName });

    if (isBlogExist) {
      return next(new AppError(409, "blog name already exists"));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new AppError(404, `category: ${categoryId} not found`));
    }

    const lastBlog = await Blog.findOne().sort("-order").exec();
    const nextOrder = lastBlog ? lastBlog.order + 1 : 1;

    const blog = await Blog.create({
      name: blogName,
      description,
      category: categoryId,
      order: nextOrder,
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

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new AppError(404, `Blog with ID ${blogId} not found.`));
    }

    if (blogName && blogName !== blog.name) {
      const duplicateBlog = await Blog.findOne({ name: blogName });
      if (duplicateBlog) {
        return next(
          new AppError(
            409,
            "Blog name already exists. Choose a different name."
          )
        );
      }
    }

    let category = blog.category;
    if (categoryId) {
      const categoryDoc = await Category.findById(categoryId);
      if (!categoryDoc) {
        return next(
          new AppError(404, `Category with ID ${categoryId} not found.`)
        );
      }
      category = categoryDoc._id;
    }

    const thumbnail = await resizeThumbnail(
      "blogs",
      blogId,
      req.files as IUploadFiles
    );
    const isOldThumbnailCustom = blog.thumbnail !== thumbnailsDefault("blogs");

    if (thumbnail && isOldThumbnailCustom) {
      const oldThumbPath = join(
        __dirname,
        "../public/images/blogs/thumbnails",
        blog.thumbnail
      );
      try {
        await access(oldThumbPath, constants.F_OK);
        await unlink(oldThumbPath);
      } catch (err) {
        console.warn("Previous thumbnail not found:", err);
      }
    }

    const newImages = await resizeImages(
      "blogs",
      blogId,
      req.files as IUploadFiles
    );
    const hasCustomImages = !imagesDefault("blogs").every((img) =>
      blog.images.includes(img)
    );

    if (newImages.length && hasCustomImages) {
      for (const img of blog.images) {
        const imgPath = join(__dirname, "../public/images/blogs/images", img);
        try {
          await access(imgPath, constants.F_OK);
          await unlink(imgPath);
        } catch (err) {
          console.warn("Previous image not found:", err);
        }
      }
    }

    blog.name = blogName ?? blog.name;
    blog.description = description ?? blog.description;
    blog.category = category;
    blog.thumbnail = thumbnail ?? blog.thumbnail;
    blog.images = newImages.length ? newImages : blog.images;

    await blog.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: { blog },
    });
  } catch (error) {
    next(
      new AppError(
        500,
        error instanceof Error ? error.message : "Unknown server error"
      )
    );
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

const editOrderBlogs = async (
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

    await Blog.bulkWrite(bulkOps);

    const updated = await Blog.find().sort({ order: 1 });

    res.status(200).json({
      status: "success",
      message: "Orders updated successfully",
      data: { blogs: updated },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getBlogs,
  getBlogById,
  addBlog,
  editBlogById,
  removeBlogById,
  editOrderBlogs,
};
