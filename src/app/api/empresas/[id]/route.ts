// src/app/api/empresas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Importa a config do NextAuth
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Usa o cliente admin para segurança

// Função para BUSCAR uma empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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

// Função para ATUALIZAR (Editar) uma empresa por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;
  try {
    const empresaData = await request.json();

    // Validação de campos obrigatórios na atualização
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

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Empresa atualizada com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Função para DELETAR uma empresa por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = params;
  try {
    const { error } = await supabaseAdmin.from('empresas').delete().eq('id', id);

    if (error) {
      if (error.code === '23503') {
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
