import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../lib/supabaseAdmin'; // use o alias!
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import emailjs from '@emailjs/nodejs';

emailjs.init({
  publicKey: 'sXgvRMEIHcWyaPq-U',
  privateKey: '0uX7y3Zws0C7YUZ0jZlZS',
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Aqui é importante checar se user existe antes de acessar user_role!
  if (!session || !session.user || session.user.user_role !== 'admin') {
    return NextResponse.json(
      { error: 'Acesso negado. Requer privilégios de administrador.' },
      { status: 403 }
    );
  }

  try {
    const { email } = await request.json();

    const token = crypto.randomUUID();
    const invite_link = `${process.env.NEXT_PUBLIC_SITE_URL}/cadastro?token=${token}`;

    // Salva o convite no banco
    const { error: dbError } = await supabaseAdmin
      .from('convites')
      .insert({ email, token });
    if (dbError) {
      console.error('Erro ao salvar convite no banco:', dbError);
      return NextResponse.json({ error: 'Erro ao salvar no banco.' }, { status: 500 });
    }

    // Envia o e-mail pelo EmailJS
    const result = await emailjs.send(
      'service_slh4yoh',
      'template_yzdk3nq',
      {
        to_email: email,
        name: 'Convidado',
        invite_link,
      }
    );

    console.log('✅ E-mail enviado com status:', result.status);
    return NextResponse.json({ message: 'Convite enviado com sucesso!' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erro ao enviar com EmailJS:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar e-mail de convite.' },
      { status: 500 }
    );
  }
}
