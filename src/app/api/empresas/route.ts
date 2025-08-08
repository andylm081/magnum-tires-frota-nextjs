// src/app/api/empresas/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Importa a config do NextAuth
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para LISTAR todas as empresas (GET)
export async function GET(request: Request) {
  // 1. Protege a rota com NextAuth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Se autenticado, busca os dados com Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('id, razao_social') // Otimizado para buscar apenas o necessário
      .order('razao_social', { ascending: true });

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: 'Erro ao buscar empresas.', details: error.message }, { status: 500 });
  }
}

// Função para CRIAR uma nova empresa (POST)
export async function POST(request: Request) {
  // 1. Protege a rota com NextAuth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Se autenticado, executa a lógica de criação com Supabase
  try {
    const empresaData = await request.json();

    const requiredFields = ['razao_social', 'cnpj', 'cidade'];
    const missingFields = requiredFields.filter(field => !empresaData[field]);

    if (missingFields.length > 0) {
      const errorMessage = `Campos obrigatórios em falta: ${missingFields.join(', ')}`;
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('empresas')
      .insert([empresaData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: `O CNPJ "${empresaData.cnpj}" já está cadastrado.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Empresa adicionada com sucesso!", data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Erro interno do servidor.', details: error.message }, { status: 500 });
  }
}
