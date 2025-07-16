import cors from "cors";
import express from "express";
import { join } from "node:path";
import bodyParser from "body-parser";
import apiRouters from "./routers/api-router";
import globalErrorHandler from "./middlewares/error-handler";
import { AppError } from "./utils/app-error";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, "./public")));

// routers
app.use("/api", apiRouters);

// error handler
app.use(globalErrorHandler);

// 404 error handler

app.all("*", (req, res, next) => {
  next(new AppError(404, `can't find ${req.method} ${req.originalUrl}`));
});

export { app };
