import cors from "cors";
import express from "express";
import { join } from "node:path";
import bodyParser from "body-parser";
import addAdmin from "./utils/add-admin";
import { AppError } from "./utils/app-error";
import apiRouters from "./routers/api-router";
import globalErrorHandler from "./middlewares/error-handler";
import connectToDatabase from "./database/database-connection";

const app = express();

app.use(cors());

// database connection
connectToDatabase().then(() => addAdmin());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, "./public")));
// app.use("/api/images", express.static(join(__dirname, "./public/images")));

// routers
app.use("/api", apiRouters);

// 404 error handler
app.all("*", (req, res, next) => {
  next(new AppError(404, `can't find ${req.method} ${req.originalUrl}`));
});

// error handler
app.use(globalErrorHandler);

export { app };
