import { createServer } from "node:http";
import { app } from "./app";

const port = process.env.PORT;
const host = process.env.HOST;

const server = createServer(app);

server.listen(port, () =>
  console.info(`[i] server running on ${host}:${port}...`)
);
