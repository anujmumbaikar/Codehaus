import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient()
// why not always use new PrismaClient?
// because of nextjs hot reloading , so whenever the file, or code is changed, it creates a new instance of PrismaClient
// this can lead to too many connections to the database. which can be problematic
// so we use a global variable to store the instance of PrismaClient
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma