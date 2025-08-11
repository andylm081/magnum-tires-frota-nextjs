// src/app/api/admin/invite/route.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import emailjs from '@emailjs/nodejs';

// Inicializa o EmailJS com as suas variáveis de ambiente
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado. Requer privilégios de administrador.' }, { status: 403 });
  }

  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'E-mail e função são obrigatórios.' }, { status: 400 });
    }

    // Gera um token de convite único
    const token = crypto.randomUUID();

    // Salva o convite no banco de dados usando Prisma
    await prisma.invite.create({
      data: {
        email,
        role,
        token,
      },
    });

    // Prepara e envia o e-mail de convite
    const inviteLink = `${process.env.NEXTAUTH_URL}/signup?token=${token}`;
    
    await emailjs.send('service_slh4yoh', 'template_yzdk3nq', {
      to_email: email,
      invite_link: inviteLink,
    });

    return NextResponse.json({ message: 'Convite enviado com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar o convite:', error);
    return NextResponse.json({ error: 'Falha ao enviar o convite.' }, { status: 500 });
  }
}
