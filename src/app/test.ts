import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  // Imprimir todos os métodos disponíveis no prisma para debug
  console.log(Object.keys(prisma));
  
  // Fechar a conexão do prisma
  await prisma.$disconnect();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 