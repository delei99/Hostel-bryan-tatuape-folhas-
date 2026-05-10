import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getUserAuthorization, createUserAuthorization, approveUserAuthorization, rejectUserAuthorization, getPendingAuthorizations, getAllRoomsData, getRoomData, saveAllRoomsData } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  rooms: router({
    getAllRoomsData: protectedProcedure.query(async () => {
      return await getAllRoomsData();
    }),
    
    getRoomData: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'roomNumber' in val) {
          return val as { roomNumber: number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input }) => {
        return await getRoomData(input.roomNumber);
      }),
    
    saveAllRoomsData: protectedProcedure
      .input((val: unknown) => {
        if (Array.isArray(val)) {
          return val as any[];
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ input }) => {
        await saveAllRoomsData(input);
        return { success: true };
      }),
  }),

  authorization: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      return await getUserAuthorization(ctx.user.id);
    }),
    
    requestAccess: protectedProcedure.mutation(async ({ ctx }) => {
      const existing = await getUserAuthorization(ctx.user.id);
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Você já solicitou acesso',
        });
      }
      return await createUserAuthorization(ctx.user.id);
    }),
    
    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem ver solicitações pendentes',
        });
      }
      return await getPendingAuthorizations();
    }),
    
    approve: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'authId' in val) {
          return val as { authId: number };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas administradores podem aprovar solicitações',
          });
        }
        await approveUserAuthorization(input.authId, ctx.user.id);
        return { success: true };
      }),
    
    reject: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'authId' in val) {
          return val as { authId: number };
        }
        throw new Error('Invalid input');
      })
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas administradores podem rejeitar solicitações',
          });
        }
        await rejectUserAuthorization(input.authId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
