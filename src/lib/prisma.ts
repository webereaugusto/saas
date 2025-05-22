import { PrismaClient } from "@prisma/client";

// Exportar uma instância única do PrismaClient para toda a aplicação
export const prisma = new PrismaClient(); 