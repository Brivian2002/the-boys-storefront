import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "../server/_core/context";
import { appRouter } from "../server/routers";

/**
 * Vercel serverless handler. It exposes only the application RPC surface; the
 * Blogger credentials remain server-only in the function environment.
 */
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
