import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { tr } from "date-fns/locale";
import z from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/useageTracker";

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({
      id: z.string().min(1, "Project ID is required"),
    }))
    .query(async ({input}) => {
      const existingProject = await prisma.project.findUnique({
        where:{
            id: input.id,
        }
      });
        if (!existingProject) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Project not found",
            });
        }
      return existingProject;
    }),
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, "Message cannot be empty")
          .max(10000, "Message cannot be longer than 1000 characters"),
        //prompt
      })
    )
    .mutation(async ({ input }) => {
      try {
          await consumeCredits()
      } catch (error) {
          if(error instanceof Error) {
              throw new Error(`Failed to consume credits: ${error.message}`);
          }
          throw new Error("Failed to consume credits");
      }
      const createdProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });
      return createdProject;
    }),
});
