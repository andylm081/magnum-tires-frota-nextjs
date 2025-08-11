// src/app/api/admin/users/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // ✅ apenas IMPORT, sem export
import prisma from '@/lib/prisma';

// PATCH - Atualizar usuário
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  try {
    const { email, role } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, role },
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar utilizador.' }, { status: 500 });
  }
}

// DELETE - Remover usuário
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Utilizador removido com sucesso.' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Erro ao remover utilizador.' }, { status: 500 });
  }
}
