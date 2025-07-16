import { Router } from "express";
import projectRouters from "./project-router";
import blogRouters from "./blog-router";
import ticketRouters from "./ticket-router";

const router = Router();

router.use("/projects", projectRouters);
router.use("/blogs", blogRouters);
router.use("/tickets", ticketRouters);

export default router;
