// src/app/api/invite-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('convites')
    .select('role')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Convite não encontrado ou expirado' },
      { status: 404 }
    );
  }

  return NextResponse.json({ role: data.role }, { status: 200 });
}
