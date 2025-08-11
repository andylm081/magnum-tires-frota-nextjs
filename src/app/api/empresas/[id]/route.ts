// src/app/api/empresas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function getIdFromParams(params: Record<string, string | string[]>) {
  const val = params.id;
  return Array.isArray(val) ? val[0] : val;
}

// GET /api/empresas/[id]
export async function GET(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromParams(context.params);
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json(
          { message: `Empresa com ID ${id} não encontrada.` },
          { status: 404 }
        );
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/empresas/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromParams(context.params);
  try {
    const empresaData = await request.json();

    if (!empresaData.razao_social || !empresaData.cnpj || !empresaData.cidade) {
      return NextResponse.json(
        { message: 'Razão Social, CNPJ e Cidade são obrigatórios.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('empresas')
      .update(empresaData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Empresa atualizada com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/empresas/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const id = getIdFromParams(context.params);
  try {
    const { error } = await supabaseAdmin.from('empresas').delete().eq('id', id);

    if (error) {
      if ((error as any).code === '23503') {
        return NextResponse.json(
          {
            message:
              'Não é possível excluir: esta empresa está associada a outros registros.',
          },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ message: 'Empresa excluída com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
