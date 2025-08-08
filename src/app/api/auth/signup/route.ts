// Ficheiro 2: src/app/api/auth/signup/route.ts
// Esta rota cria um novo utilizador.
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nomeCompleto, telefone, cpf, cargo, token } = body;

    if (!email || !password || !nomeCompleto || !token) {
      return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
    }

    // 1. Valida novamente o token do convite
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.email !== email) {
      return NextResponse.json({ error: 'Convite inválido ou e-mail não corresponde ao convite.' }, { status: 400 });
    }

    // 2. Verifica se o e-mail já está registado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    // 3. Criptografa a senha
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Cria o Utilizador e o Perfil numa transação para garantir a consistência
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: invite.role, // A 'role' vem do convite
        },
      });

      await tx.profile.create({
        data: {
          id: newUser.id, // Usa o mesmo ID do utilizador
          nomeCompleto,
          telefone,
          cpf,
          cargo,
        },
      });

      // 5. Remove o convite para que não possa ser usado novamente
      await tx.invite.delete({
        where: { token },
      });
    });

    return NextResponse.json({ message: 'Conta criada com sucesso!' }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar a conta:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}