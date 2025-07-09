import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const messagesRouter = createTRPCRouter({
    getMany:baseProcedure
        .query(async ()=>{
            const messages = await prisma.message.findMany({
                orderBy: {
                    createdAt: 'desc',
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

