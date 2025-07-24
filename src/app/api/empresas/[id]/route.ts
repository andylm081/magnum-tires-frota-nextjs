// src/app/api/empresas/[id]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Função para BUSCAR uma empresa por ID
export async function GET(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'ID da empresa não fornecido.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // not found
        return NextResponse.json({ message: `Empresa com ID ${id} não encontrada.` }, { status: 404 });
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar detalhes da empresa:", error.message);
    return NextResponse.json({ message: error.message || 'Erro no servidor' }, { status: 500 });
  }
}

// Função para ATUALIZAR (Editar) uma empresa por ID
export async function PUT(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'ID da empresa não fornecido.' }, { status: 400 });
  }
  
  try {
    const empresaData = await request.json();
    if (!empresaData) {
      return NextResponse.json({ message: 'Dados para atualização não fornecidos.' }, { status: 400 });
    }

    // Remove a máscara do CNPJ e CEP antes de salvar
    if (empresaData.cnpj) {
        empresaData.cnpj = empresaData.cnpj.replace(/\D/g, '');
    }
    if (empresaData.cep) {
        empresaData.cep = empresaData.cep.replace(/\D/g, '');
    }

    const { error } = await supabase
      .from('empresas')
      .update(empresaData)
      .eq('id', id);

    if (error) { throw error; }

    return NextResponse.json({ message: 'Empresa atualizada com sucesso!' });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error.message);
    return NextResponse.json({ message: error.message || 'Erro ao processar a requisição.' }, { status: 500 });
  }
}

// Função para DELETAR uma empresa por ID
export async function DELETE(request, { params }) {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: 'ID da empresa não fornecido.' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('empresas')
            .delete()
            .eq('id', id);
        
        if (error) {
          // Trata erro de chave estrangeira (se a empresa estiver em uso)
          if (error.code === '23503') {
            return NextResponse.json({ message: 'Não é possível excluir: esta empresa está associada a outros registros (veículos, etc.).' }, { status: 409 });
          }
          throw error;
        }
        
        return NextResponse.json({ message: 'Empresa excluída com sucesso!' });
    } catch (error) {
        console.error("Erro ao deletar empresa:", error.message);
        return NextResponse.json({ message: error.message || 'Erro ao excluir a empresa.' }, { status: 500 });
    }
}
