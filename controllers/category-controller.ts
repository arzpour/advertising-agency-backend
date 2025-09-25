// import { Request, Response, NextFunction } from "express";
// import sharp from "sharp";
// import { join } from "path";
// import { access, unlink, mkdir } from "fs/promises";
// import { constants, existsSync } from "fs";
// import Category from "../models/category";
// import { ApiFeatures } from "../utils/api-features";
// import { AppError } from "../utils/app-error";
// import { IQueryString } from "../types/global";
// import multerUpload from "../utils/multer-config";

// // default icon name
// const categoriesIconsDefault = "categories-icons-default.png";

// //** services
// const uploadCategoryIcon = multerUpload.single("icon");

// // Resize uploaded icon
// const resizeCategoryIcon = async (
//   categoryId: string,
//   file: Express.Multer.File | undefined | null
// ): Promise<string | null> => {
//   if (!file) return null;

//   const iconFilename = `categories-${categoryId}-${Date.now()}.png`;
//   const iconsPath = join(__dirname, "../public/images/categories/icons");

//   if (!existsSync(iconsPath)) {
//     await mkdir(iconsPath, { recursive: true });
//   }

//   await sharp(file.buffer)
//     .resize(50, 50)
//     .toFormat("png")
//     .png({ quality: 100 })
//     .toFile(
//       join(__dirname, `../public/images/categories/icons/${iconFilename}`)
//     );

//   return iconFilename;
// };

// // Get all categories with pagination, filters, etc.
// const getAllCategories = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { page = "1", limit = "10" } = req.query;

//   const categoriesModel = new ApiFeatures(
//     Category.find(),
//     req.query as IQueryString
//   )
//     .limitFields()
//     .paginate()
//     .filter();

//   const categories = await categoriesModel.getQuery().sort({ order: 1 });

//   const totalModels = new ApiFeatures(
//     Category.find(),
//     req.query as IQueryString
//   ).filter();
//   const total = await totalModels.getQuery();
//   const totalPages = Math.ceil(total.length / Number(limit));

//   res.status(200).json({
//     status: "success",
//     page: Number(page),
//     per_page: Number(limit),
//     total: total.length,
//     total_pages: totalPages,
//     data: { categories },
//   });
// };

// // Create a new category
// const addCategory = async (req: Request, res: Response, next: NextFunction) => {
//   const { name: categoryName, description } = req.body;

//   const isCategoryExists = await Category.exists({ name: categoryName });
//   if (isCategoryExists) {
//     return next(
//       new AppError(
//         409,
//         "category name is already exists. choose a different category name"
//       )
//     );
//   }

//   const lastCategory = await Category.findOne().sort("-order").exec();
//   const nextOrder = lastCategory ? lastCategory.order + 1 : 1;

//   const category = await Category.create({
//     name: categoryName,
//     description,
//     order: nextOrder,
//   });

//   const icon = await resizeCategoryIcon(category._id.toString(), req.file);
//   category.icon = icon ?? categoriesIconsDefault;

//   await category.save({ validateModifiedOnly: true });

//   res.status(201).json({
//     status: "success",
//     data: { category },
//   });
// };

// // Get category by ID
// const getCategoryById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id: categoryId } = req.params;

//   const category = await Category.findById(categoryId);
//   if (!category) {
//     return next(new AppError(404, `category: ${categoryId} not found`));
//   }

//   res.status(200).json({
//     status: "success",
//     data: { category },
//   });
// };

// // Edit category
// const editCategoryById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id: categoryId } = req.params;
//   const { name: categoryName = null, description = null } = req.body;

//   const category = await Category.findById(categoryId);
//   if (!category) {
//     return next(new AppError(404, `category: ${categoryId} not found`));
//   }

//   const duplicateCategory = await Category.findOne({ name: categoryName });
//   if (duplicateCategory && duplicateCategory.name !== category.name) {
//     return next(
//       new AppError(
//         409,
//         "category name is already exists. choose a different category name"
//       )
//     );
//   }

//   const icon = await resizeCategoryIcon(categoryId, req.file);

//   if (icon && category.icon !== categoriesIconsDefault) {
//     try {
//       await access(
//         join(__dirname, "../public/images/categories/icons", category.icon),
//         constants.F_OK
//       );
//       await unlink(
//         join(__dirname, "../public/images/categories/icons", category.icon)
//       );
//     } catch (error) {
//       if (error instanceof Error) {
//         return next(new AppError(500, error.message));
//       }
//     }
//   }

//   category.name = categoryName ?? category.name;
//   category.description = description ?? category.description;
//   category.icon = icon ?? category.icon;

//   await category.save({ validateBeforeSave: true });

//   res.status(200).json({
//     status: "success",
//     data: { category },
//   });
// };

// // Delete category
// const removeCategoryById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { id: categoryId } = req.params;

//   const category = await Category.findByIdAndDelete(categoryId);
//   if (!category) {
//     return next(new AppError(404, `category: ${categoryId} not found`));
//   }

//   if (category.icon !== categoriesIconsDefault) {
//     try {
//       await access(
//         join(__dirname, "../public/images/categories/icons", category.icon),
//         constants.F_OK
//       );
//       await unlink(
//         join(__dirname, "../public/images/categories/icons", category.icon)
//       );
//     } catch (error) {
//       if (error instanceof Error) {
//         return next(new AppError(500, error.message));
//       }
//     }
//   }

//   res.status(200).json({
//     status: "success",
//     data: { category },
//   });
// };

// const editOrderCategories = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { orders } = req.body;

//     if (!orders || !Array.isArray(orders)) {
//       return next(new AppError(400, "Invalid orders format"));
//     }

//     const bulkOps = orders.map((item) => ({
//       updateOne: {
//         filter: { _id: item.id },
//         update: { $set: { order: item.order } },
//       },
//     }));

//     await Category.bulkWrite(bulkOps);

//     const updated = await Category.find().sort({ order: 1 });

//     res.status(200).json({
//       status: "success",
//       message: "Orders updated successfully",
//       data: { categories: updated },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export {
//   addCategory,
//   getAllCategories,
//   getCategoryById,
//   editCategoryById,
//   removeCategoryById,
//   resizeCategoryIcon,
//   uploadCategoryIcon,
//   editOrderCategories,
// };
