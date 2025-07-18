import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
import { messagesRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { useageRouter } from '@/modules/useage/server/procedures';

export const appRouter = createTRPCRouter({
  messages:messagesRouter,
  projects:projectsRouter,
  useage:useageRouter
});
export type AppRouter = typeof appRouter;