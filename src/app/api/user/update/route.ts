import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    const { name, password, newPassword } = body;
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se está alterando a senha
    if (newPassword) {
      // Verificar se a senha atual está correta
      if (!user.password) {
        return NextResponse.json(
          { message: 'Usuário não possui senha definida' },
          { status: 400 }
        );
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { message: 'Senha atual incorreta' },
          { status: 400 }
        );
      }
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Atualizar usuário com nova senha
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || user.name,
          password: hashedPassword,
        },
      });
    } else {
      // Atualizar apenas o nome
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || user.name,
        },
      });
    }
    
    return NextResponse.json(
      { message: 'Perfil atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
} 