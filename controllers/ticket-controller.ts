import { NextFunction, Request, Response } from "express";
import { ApiFeatures } from "../utils/api-features";
import { AppError } from "../utils/app-error";
import Ticket from "../models/ticket";

const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketModel = new ApiFeatures<ITicket>(
      Ticket.find({}),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter()
      .sort();

    const tickets = ticketModel.getQuery();

    const { page = 1, limit = 10 } = req.query;

    const totalModels = new ApiFeatures<ITicket>(
      Ticket.find(),
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
      data: { tickets },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const getTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: ticketId } = req.params;

  try {
    const ticketById = await Ticket.findById(ticketId);

    if (!ticketById) {
      return next(new AppError(404, `ticket: ${ticketId} not found`));
    }

    res.status(200).json({
      status: "success",
      data: { ticketById },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

const addTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, phoneNumber, message, status } = req.body;

    const isTicketExist = await Ticket.exists({ message, phoneNumber });

    if (!!isTicketExist) {
      return next(new AppError(409, "this ticket already exists"));
    }

    const ticket = await Ticket.create({
      userId,
      phoneNumber,
      message,
      status,
    });

    await ticket.save({ validateModifiedOnly: true });

    res.status(201).json({
      status: "success",
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

const getTicketsByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber } = req.params;

  try {
    const ticketModel = new ApiFeatures<ITicket>(
      Ticket.find({ phoneNumber }),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter()
      .sort();

    const tickets = ticketModel.getQuery();

    const { page = 1, limit = 10 } = req.query;

    const totalModels = new ApiFeatures<ITicket>(
      Ticket.find({ phoneNumber }),
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
      data: { tickets },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new AppError(500, error.message));
    }
  }
};

export { getTickets, getTicketById, addTicket, getTicketsByPhone };
