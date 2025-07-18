import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { consumeCredits } from "@/lib/useageTracker";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const messagesRouter = createTRPCRouter({ 
    getMany:baseProcedure
        .input(
            z.object({
                projectId: z.string()
                    .min(1, "Project ID is required")
            }),
        )
        .query(async ({input})=>{
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId,
                },
                include:{
                    Fragment: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                
            });
            return messages;
        }),
    create: baseProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, "Message cannot be empty")
                    .max(10000, "Message cannot be longer than 1000 characters"),

                projectId: z.string()
                    .min(1, "Project ID is required")
            }),
        )
        .mutation(async ({input})=>{
            try {
                await consumeCredits()
            } catch (error) {
                if(error instanceof Error) {
                    throw new Error(`Failed to consume credits: ${error.message}`);
                }
                throw new Error("Failed to consume credits");
            }
            const createdMessage = await prisma.message.create({
                data:{
                    content: input.value,
                    role: "USER",
                    type: "RESULT",
                    projectId: input.projectId,
                }
            });
            await inngest.send({
                name: 'code-agent/run',
                data: {
                    value: input.value,
                    projectId: input.projectId,
                },
            })
            return createdMessage;
        })                   
});

