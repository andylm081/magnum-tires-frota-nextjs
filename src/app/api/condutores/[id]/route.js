// src/app/api/condutores/[id]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Função para BUSCAR um condutor por ID
export async function GET(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'ID do condutor não fornecido.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('condutores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ message: `Condutor com ID ${id} não encontrado.` }, { status: 404 });
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Erro no servidor' }, { status: 500 });
  }
}

// Função para ATUALIZAR (Editar) um condutor por ID
export async function PUT(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'ID do condutor não fornecido.' }, { status: 400 });
  }
  
  try {
    const condutorData = await request.json();
    if (!condutorData) {
      return NextResponse.json({ message: 'Dados para atualização não fornecidos.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('condutores')
      .update(condutorData)
      .eq('id', id);

    if (error) { throw error; }

    return NextResponse.json({ message: 'Condutor atualizado com sucesso!' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Erro ao processar a requisição.' }, { status: 500 });
  }
}

// ... (Sua função DELETE pode continuar aqui)