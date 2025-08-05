import dotenv from "dotenv";
import fs from "fs";
import { join } from "node:path";

// check if .env exists
const envPath = join(__dirname, "./.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("[+] Loaded .env from file.");
} else {
  console.warn("⚠️ .env not found — relying on environment variables.");
}

// continue app normally
import connectToDatabase from "./database/database-connection";
import { createServer } from "node:http";
import { app } from "./app";

connectToDatabase();
const port = process.env.PORT ?? 8080;
const host = process.env.HOST ?? "0.0.0.0";

const server = createServer(app);

server.listen(port, () =>
  console.info(`[i] server running on ${host}:${port}...`)
);
