const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar se o usuário admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe! Email: admin@example.com');
      return;
    }

    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Usuário admin criado com sucesso!');
    console.log('Email: admin@example.com');
    console.log('Senha: admin123');
    console.log('ID: ' + adminUser.id);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 