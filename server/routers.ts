import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getCatalog } from "./catalog";
import { initializePaystackCheckout, listPaystackSales, verifyPaystackTransaction } from "./paystack";
import { createProductPost, deleteProductPost, listManagedPosts, updateProductPost } from "./bloggerAdmin";
import { createDashboardSession, dashboardCookieOptions, hasDashboardSession, OPS_COOKIE, verifyDashboardPassword } from "./opsAuth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const checkoutInput = z.object({
  lines: z.array(z.object({ id: z.string().min(1).max(128), quantity: z.number().int().min(1).max(10) })).min(1).max(25),
  contact: z.object({ email: z.string().email().max(320), name: z.string().min(2).max(120), phone: z.string().min(6).max(32), address: z.string().min(8).max(300), city: z.string().min(2).max(120) }),
});

const productPostInput = z.object({ id: z.string().min(1).max(128).optional(), title: z.string().min(2).max(180), description: z.string().min(2).max(8000), price: z.number().positive().max(100_000_000), currency: z.string().regex(/^[A-Za-z]{3}$/), category: z.string().max(80), collection: z.string().max(80), materials: z.array(z.string().max(80)).max(8), availability: z.enum(["in-stock", "out-of-stock", "preorder", "hidden"]), featured: z.boolean().optional(), newArrival: z.boolean().optional(), sale: z.boolean().optional(), imageUrls: z.array(z.string().url().max(1200)).max(6), publishNow: z.boolean() });

function applicationOrigin(req: { protocol?: string; get: (name: string) => string | undefined }) {
  const configured = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const protocol = req.get("x-forwarded-proto") ?? req.protocol ?? "https";
  if (!host) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to establish a safe payment return URL." });
  return `${protocol}://${host}`;
}

const opsProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!await hasDashboardSession(ctx.req)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Private operations access is required." });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => getCatalog()),
  }),
  checkout: router({
    initialize: publicProcedure.input(checkoutInput).mutation(async ({ input, ctx }) => {
      try {
        const { products } = await getCatalog();
        return await initializePaystackCheckout({ ...input, callbackUrl: `${applicationOrigin(ctx.req)}/checkout/verify` }, products);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to begin secure checkout." });
      }
    }),
    verify: publicProcedure.input(z.object({ reference: z.string().min(8).max(180).regex(/^[A-Za-z0-9.=-]+$/) })).query(async ({ input }) => {
      try { return await verifyPaystackTransaction(input.reference); }
      catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to verify payment." }); }
    }),
  }),
  operations: router({
    status: publicProcedure.query(async ({ ctx }) => ({ authenticated: await hasDashboardSession(ctx.req), configured: Boolean(process.env.ADMIN_DASHBOARD_PASSWORD?.trim()) })),
    login: publicProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!verifyDashboardPassword(input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect dashboard password." });
      ctx.res.cookie(OPS_COOKIE, await createDashboardSession(), dashboardCookieOptions(ctx.req));
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(OPS_COOKIE, { ...dashboardCookieOptions(ctx.req), maxAge: -1 }); return { success: true } as const; }),
    posts: opsProcedure.query(() => listManagedPosts()),
    createPost: opsProcedure.input(productPostInput).mutation(({ input }) => createProductPost(input)),
    updatePost: opsProcedure.input(productPostInput.extend({ id: z.string().min(1).max(128) })).mutation(({ input }) => updateProductPost(input)),
    deletePost: opsProcedure.input(z.object({ id: z.string().min(1).max(128) })).mutation(({ input }) => deleteProductPost(input.id)),
    sales: opsProcedure.query(async () => {
      const sales = await listPaystackSales();
      const totals = sales.reduce<Record<string, number>>((all, sale) => { all[sale.currency] = (all[sale.currency] ?? 0) + sale.amount; return all; }, {});
      return { sales, totals };
    }),
  }),
});

export type AppRouter = typeof appRouter;
