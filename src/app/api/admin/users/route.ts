// Ficheiro 2: src/app/api/admin/users/route.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            include: {
                Profile: true, // Inclui os dados do perfil associado
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar utilizadores:", error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}