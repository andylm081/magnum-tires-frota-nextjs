// src/app/api/perfil/route.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// --- NOVO: Função para lidar com requisições GET (buscar perfil) ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      // Se o perfil não existir, retorna um objeto vazio para o frontend preencher
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar o perfil:", error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}


// Função para lidar com requisições PATCH (atualização de perfil)
export async function PATCH(request: Request) {
  // 1. Obtém a sessão do utilizador usando a configuração do NextAuth
  const session = await getServerSession(authOptions);

  // 2. Verifica se o utilizador está autenticado
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: 'Não autorizado. Por favor, faça login.' },
      { status: 401 }
    );
  }

  try {
    // 3. Obtém os dados enviados no corpo da requisição
    const body = await request.json();
    const { nomeCompleto, telefone, cpf, cargo } = body;

    // 4. Obtém o ID do utilizador a partir da sessão segura
    const userId = session.user.id;

    // 5. Atualiza o perfil no banco de dados usando o Prisma
    // O `upsert` atualiza o perfil se ele existir, ou cria um novo caso contrário.
    const updatedProfile = await prisma.profile.upsert({
      where: {
        id: userId, // A chave primária do Perfil é o mesmo ID do User
      },
      update: {
        nomeCompleto,
        telefone,
        cpf,
        cargo,
      },
      create: {
        id: userId, // Conecta o novo perfil ao utilizador logado
        nomeCompleto,
        telefone,
        cpf,
        cargo,
      },
    });

    // 6. Retorna uma resposta de sucesso
    return NextResponse.json(updatedProfile, { status: 200 });

  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    // 7. Retorna uma resposta de erro genérica
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor.' },
      { status: 500 }
    );
  }
}
