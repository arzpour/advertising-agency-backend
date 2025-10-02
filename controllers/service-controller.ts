import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import { join } from "path";
import { access, unlink, mkdir } from "fs/promises";
import { constants, existsSync } from "fs";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";
import { IQueryString } from "../types/global";
import multerUpload from "../utils/multer-config";
import Service from "../models/services";

// default icon name
const servicesIconsDefault = "services-icons-default.png";

//** services
const uploadServicesIcon = multerUpload.single("icon");

// Resize uploaded icon
const resizeServiceIcon = async (
  serviceId: string,
  file: Express.Multer.File | undefined | null
): Promise<string | null> => {
  if (!file) return null;

  const iconFilename = `services-${serviceId}-${Date.now()}.png`;
  const iconsPath = join(__dirname, "../public/images/services/icons");

  if (!existsSync(iconsPath)) {
    await mkdir(iconsPath, { recursive: true });
  }

  await sharp(file.buffer)
    .resize(50, 50)
    .toFormat("png")
    .png({ quality: 100 })
    .toFile(join(__dirname, `../public/images/services/icons/${iconFilename}`));

  return iconFilename;
};

// Get all services with pagination, filters, etc.
const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = "1", limit = "10" } = req.query;

  const servicesModel = new ApiFeatures(
    Service.find(),
    req.query as IQueryString
  )
    .limitFields()
    .paginate()
    .filter();

  const services = await servicesModel.getQuery().sort({ order: 1 });

  const totalModels = new ApiFeatures(
    Service.find(),
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
    data: { services },
  });
};

// Create a new service
const addService = async (req: Request, res: Response, next: NextFunction) => {
  const { name: serviceName, description } = req.body;

  const isServiceExists = await Service.exists({ name: serviceName });
  if (isServiceExists) {
    return next(
      new AppError(
        409,
        "Service name is already exists. choose a different service name"
      )
    );
  }

  const lastService = await Service.findOne().sort("-order").exec();
  const nextOrder = lastService ? lastService.order + 1 : 1;

  const service = await Service.create({
    name: serviceName,
    description,
    order: nextOrder,
  });

  const icon = await resizeServiceIcon(service._id.toString(), req.file);
  service.icon = icon ?? servicesIconsDefault;

  await service.save({ validateModifiedOnly: true });

  res.status(201).json({
    status: "success",
    data: { service },
  });
};

// Get service by ID
const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: serviceId } = req.params;

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError(404, `service: ${serviceId} not found`));
  }

  res.status(200).json({
    status: "success",
    data: { service },
  });
};

// Edit service
const editServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: serviceId } = req.params;
  const { name: serviceName = null, description = null } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError(404, `service: ${serviceId} not found`));
  }

  const duplicateService = await Service.findOne({ name: serviceName });
  if (duplicateService && duplicateService.name !== service.name) {
    return next(
      new AppError(
        409,
        "service name is already exists. choose a different service name"
      )
    );
  }

  const icon = await resizeServiceIcon(serviceId, req.file);

  if (icon && service.icon !== servicesIconsDefault) {
    try {
      await access(
        join(__dirname, "../public/images/services/icons", service.icon),
        constants.F_OK
      );
      await unlink(
        join(__dirname, "../public/images/services/icons", service.icon)
      );
    } catch (error) {
      if (error instanceof Error) {
        return next(new AppError(500, error.message));
      }
    }
  }

  service.name = serviceName ?? service.name;
  service.description = description ?? service.description;
  service.icon = icon ?? service.icon;

  await service.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: { service },
  });
};

// Delete service
const removeServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: serviceId } = req.params;

  const service = await Service.findByIdAndDelete(serviceId);
  if (!service) {
    return next(new AppError(404, `service: ${serviceId} not found`));
  }

  if (service.icon !== servicesIconsDefault) {
    try {
      await access(
        join(__dirname, "../public/images/services/icons", service.icon),
        constants.F_OK
      );
      await unlink(
        join(__dirname, "../public/images/services/icons", service.icon)
      );
    } catch (error) {
      if (error instanceof Error) {
        return next(new AppError(500, error.message));
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: { service },
  });
};

const editOrderServices = async (
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

    await Service.bulkWrite(bulkOps);

    const updated = await Service.find().sort({ order: 1 });

    res.status(200).json({
      status: "success",
      message: "Orders updated successfully",
      data: { service: updated },
    });
  } catch (error) {
    next(error);
  }
};

export {
  addService,
  getAllServices,
  getServiceById,
  editOrderServices,
  editServiceById,
  resizeServiceIcon,
  uploadServicesIcon,
  removeServiceById,
};
