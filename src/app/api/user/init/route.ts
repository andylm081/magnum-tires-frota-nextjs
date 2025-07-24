import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId } = await req.json();

  const { error } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    nome: '',
    telefone: '',
    cpf: '',
    cargo: '',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Perfil inicial criado.' });
}
