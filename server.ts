import dotenv from "dotenv";
import fs from "fs";

const dotenvConfig = dotenv.config({ path: join(__dirname, "./.env") });

if (dotenvConfig.error) {
  console.error(`[-] dotenv config > ${dotenvConfig.error}`);

  console.info("[i] proccess terminated");
  process.exit(1);
}

if (fs.existsSync(".env")) {
  dotenv.config();
  console.log("[+] Loaded .env");
} else {
  console.warn("⚠️ .env not found — relying on Render environment variables.");
}

import connectToDatabase from "./database/database-connection";
import { createServer } from "node:http";
import { app } from "./app";
import { join } from "node:path";

connectToDatabase();
const port = process.env.PORT;
const host = process.env.HOST;

const server = createServer(app);

server.listen(port, () =>
  console.info(`[i] server running on ${host}:${port}...`)
);
