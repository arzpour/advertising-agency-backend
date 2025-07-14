import { Request, Response } from "express";
import Project from "../models/project";
import { ApiFeatures } from "../utils/api-features";

// type getProjects = (req: Request, res: Response) => Promise<void>;

const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectModel = new ApiFeatures<IProject>(
      Project.find({}),
      req.query as IQueryString
    )
      .limitFields()
      .paginate()
      .filter()
      .sort();

    const projects = await projectModel.getQuery;

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
      res.status(500).json({ error: error.message });
    }
  }
};

// const getProjectById = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     await Project.findById(id);
//   } catch (error) {
//     console.log("🚀 ~ getProject ~ error:", error);
//   }
// };

export { getProjects };
