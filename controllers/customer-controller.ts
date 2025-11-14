import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import { join } from "path";
import { access, unlink, mkdir } from "fs/promises";
import { constants, existsSync } from "fs";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";
import { IQueryString } from "../types/global";
import multerUpload from "../utils/multer-config";
import Customer from "../models/customer";

// default icon name
const customersIconsDefault = "customers-icons-default.png";

//** customer
const uploadCustomerIcon = multerUpload.single("icon");

// Resize uploaded icon
const resizeCustomerIcon = async (
  customerId: string,
  file: Express.Multer.File | undefined | null
): Promise<string | null> => {
  if (!file) return null;

  const iconFilename = `customers-${customerId}-${Date.now()}.png`;
  const iconsPath = join(__dirname, "../public/images/customers/icons");

  if (!existsSync(iconsPath)) {
    await mkdir(iconsPath, { recursive: true });
  }

  // await sharp(file.buffer)
  //   .resize(200, 200, { fit: "inside" })
  //   .png({ quality: 100, compressionLevel: 0, adaptiveFiltering: false })
  //   .toFile(join(iconsPath, iconFilename));
  await sharp(file.buffer)
    .resize(512, 512, { fit: "inside" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(iconsPath, iconFilename));

  return iconFilename;
};

// Get all customers with pagination, filters, etc.
const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = "1", limit = "10" } = req.query;

  const customersModel = new ApiFeatures(
    Customer.find(),
    req.query as IQueryString
  )
    .limitFields()
    .paginate()
    .filter();

  const customers = await customersModel.getQuery().sort({ order: 1 });

  const totalModels = new ApiFeatures(
    Customer.find(),
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
    data: { customers },
  });
};

// Create a new customer
const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const { name: customerName } = req.body;

  const isCustomerExists = await Customer.exists({ name: customerName });
  if (isCustomerExists) {
    return next(
      new AppError(
        409,
        "Customer name already exists. Choose a different customer name"
      )
    );
  }

  const customer = await Customer.create({ name: customerName });

  const icon = await resizeCustomerIcon(customer._id.toString(), req.file);
  customer.icon = icon as string;
  await customer.save({ validateModifiedOnly: true });

  res.status(201).json({
    status: "success",
    data: { customer },
  });
};

// Get customer by ID
const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: customerId } = req.params;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError(404, `Customer: ${customerId} not found`));
  }

  res.status(200).json({
    status: "success",
    data: { customer },
  });
};

// Edit customer
const editCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: customerId } = req.params;
  const { name: customerName = null } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError(404, `Customer: ${customerId} not found`));
  }

  const duplicateCustomer = await Customer.findOne({ name: customerName });
  if (duplicateCustomer && duplicateCustomer.name !== customer.name) {
    return next(
      new AppError(
        409,
        "customer name is already exists. choose a different customer name"
      )
    );
  }

  const icon = await resizeCustomerIcon(customerId, req.file);

  if (icon && customer.icon !== customersIconsDefault) {
    try {
      await access(
        join(__dirname, "../public/images/customers/icons", customer.icon),
        constants.F_OK
      );
      await unlink(
        join(__dirname, "../public/images/customers/icons", customer.icon)
      );
    } catch (error) {
      if (error instanceof Error) {
        return next(new AppError(500, error.message));
      }
    }
  }

  customer.name = customerName ?? customer.name;
  customer.icon = icon ?? customer.icon;

  await customer.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: { customer },
  });
};

// Delete customer
const removeCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: customerId } = req.params;

  const customer = await Customer.findByIdAndDelete(customerId);
  if (!customer) {
    return next(new AppError(404, `customer: ${customerId} not found`));
  }

  if (customer.icon !== customersIconsDefault) {
    try {
      const filePath = join(
        __dirname,
        "../public/images/customers/icons",
        customer.icon
      );

      await access(filePath, constants.F_OK);
      await unlink(filePath);
    } catch (error) {
      console.log("🚀 ~ removeCustomerById ~ error:", error);
      // if (error instanceof Error) {
      //   return next(new AppError(500, error.message));
      // }
    }
  }

  res.status(200).json({
    status: "success",
    data: { customer },
  });
};

const editOrderCustomers = async (
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

    await Customer.bulkWrite(bulkOps);

    const updated = await Customer.find().sort({ order: 1 });

    res.status(200).json({
      status: "success",
      message: "Orders updated successfully",
      data: { customer: updated },
    });
  } catch (error) {
    next(error);
  }
};

export {
  addCustomer,
  getAllCustomers,
  getCustomerById,
  editOrderCustomers,
  editCustomerById,
  resizeCustomerIcon,
  uploadCustomerIcon,
  removeCustomerById,
};
