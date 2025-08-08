// Ficheiro 1: src/app/api/admin/invite/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
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
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  try {
    const { email, role } = await request.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'E-mail e função são obrigatórios.' }, { status: 400 });
    }

    const token = crypto.randomUUID();
    await prisma.invite.create({ data: { email, role, token } });

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
