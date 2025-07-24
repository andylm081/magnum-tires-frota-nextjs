import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.user_role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  const { id } = params;
  const { email, user_role } = await req.json();

  if (!id || (!email && !user_role)) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const updates = {};
  if (email) updates.email = email;
  if (user_role) updates.user_metadata = { user_role };

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Usuário atualizado com sucesso.', user: data.user });
}

export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.user_role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Usuário removido com sucesso.' });
}
