import { getUsageStatus } from "@/lib/useageTracker";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const useageRouter = createTRPCRouter({
    status:baseProcedure
    .query(async () => {
        try {
            const result = await getUsageStatus()
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("TOO_MANY_REQUESTS");
            }
            throw new Error("TOO_MANY_REQUESTS");
        }
    }),
})