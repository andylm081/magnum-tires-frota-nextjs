// src/app/api/invite/[token]/route.ts
// Esta rota valida um token de convite.

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 404 });
    }

    // Retorna o email e a função associados ao convite
    return NextResponse.json({ email: invite.email, role: invite.role }, { status: 200 });

  } catch (error) {
    console.error("Erro ao validar o token:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
