// Ficheiro 3: src/app/api/admin/users/[id]/route.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    try {
        const userId = params.id;
        const { email, role } = await request.json();
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email, role },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar utilizador.' }, { status: 500 });
    }
}

// ✅ Alteração mínima: remover tipagem estrita do segundo argumento
export async function DELETE(request: Request, context: any) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    try {
        const userId = context.params.id;
        await prisma.user.delete({
            where: { id: userId },
        });
        return NextResponse.json({ message: 'Utilizador removido com sucesso.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao remover utilizador.' }, { status: 500 });
    }
}
