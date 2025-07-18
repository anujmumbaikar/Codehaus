import {RateLimiterPrisma} from "rate-limiter-flexible";
import prisma from "./db";
import { auth } from "@clerk/nextjs/server";

const GENERATION_COST = 1;
const PRO_POINTS = 100;

export async function getUsageTracker(){
    const {has} = await auth();
    const hasProAccess = has({plan: "pro"});
    const useageTracker = new RateLimiterPrisma({
        storeClient:prisma,
        tableName:"Useage",
        points:hasProAccess ? PRO_POINTS : 10,
        duration:30*24*60*60,
    })
    return useageTracker;
}

export async function consumeCredits(){
    const {userId} = await auth();
    if(!userId) throw new Error("User not authenticated");

    try {
        const useageTracker = await getUsageTracker();
        const result = await useageTracker.consume(userId, GENERATION_COST);
        return result;
    } catch (error) {
        console.error('Rate limiter error:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('Rate limit exceeded') || 
                error.message.includes('Too Many Requests')) {
                const rateLimitError = new Error('Rate limit exceeded');
                rateLimitError.name = 'RateLimiterError';
                throw rateLimitError;
            }
        }
        throw error;
    }
}

export async function getUsageStatus(){
    const {userId} = await auth();
    if(!userId) throw new Error("User not authenticated");

    const useageTracker =  await getUsageTracker();
    const result = await useageTracker.get(userId);
    return result;
}