import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getCatalog } from "./catalog";
import { initializePaystackCheckout, verifyPaystackTransaction } from "./paystack";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const checkoutInput = z.object({
  lines: z.array(z.object({ id: z.string().min(1).max(128), quantity: z.number().int().min(1).max(10) })).min(1).max(25),
  contact: z.object({
    email: z.string().email().max(320),
    name: z.string().min(2).max(120),
    phone: z.string().min(6).max(32),
    address: z.string().min(8).max(300),
    city: z.string().min(2).max(120),
  }),
});

function applicationOrigin(req: { protocol?: string; get: (name: string) => string | undefined }): string {
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const protocol = req.get("x-forwarded-proto") ?? req.protocol ?? "https";
  if (!host) throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to establish a safe checkout return URL." });
  return `${protocol}://${host}`;
}

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
        return await initializePaystackCheckout({ ...input, callbackUrl: `${applicationOrigin(ctx.req)}/checkout/verify` });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to begin checkout." });
      }
    }),
    verify: publicProcedure.input(z.object({ reference: z.string().min(8).max(180).regex(/^[A-Za-z0-9.=\-]+$/) })).query(async ({ input }) => {
      try {
        return await verifyPaystackTransaction(input.reference);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to verify payment." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
