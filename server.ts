import { createServer } from "node:http";
import { app } from "./app";

const port = process.env.NEXT_PUBLIC_PORT ?? 8000;
const host = process.env.NEXT_PUBLIC_HOST ?? "127.0.0.1";

const server = createServer(app);

server.listen(port, () =>
  console.info(`[i] server running on ${host}:${port}...`)
);
