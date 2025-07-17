import dotenv from "dotenv";
const dotenvConfig = dotenv.config();

if (!!dotenvConfig.error) {
  console.error(`[-] dotenv config > ${dotenvConfig.error}`);

  console.info("[i] proccess terminated");
  process.exit(1);
}

import connectToDatabase from "./database/database-connection";
import { createServer } from "node:http";
import { app } from "./app";

connectToDatabase();
const port = process.env.PORT;
const host = process.env.HOST;

const server = createServer(app);

server.listen(port, () =>
  console.info(`[i] server running on ${host}:${port}...`)
);
