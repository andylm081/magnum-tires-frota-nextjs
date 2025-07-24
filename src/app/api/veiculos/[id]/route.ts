import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para buscar um único veículo (GET)
export async function GET(request, { params }) {
    const { id } = params;
    try {
        // CORRIGIDO: A consulta agora seleciona todas as colunas existentes,
        // ignorando a antiga coluna 'status_veiculo'.
        const { data, error } = await supabaseAdmin
            .from('veiculos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            // Se o erro for "PGRST116", significa que não encontrou o registo
            if (error.code === 'PGRST116') {
                return NextResponse.json({ message: `Veículo com ID ${id} não encontrado.` }, { status: 404 });
            }
            throw error;
        }

        if (!data) {
            return NextResponse.json({ message: `Veículo com ID ${id} não encontrado.` }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Erro ao buscar veículo ${id}:`, error.message);
        return NextResponse.json({ message: `Erro ao buscar dados do veículo.`, details: error.message }, { status: 500 });
    }
}

// Função para ATUALIZAR (PUT) um veículo existente
export async function PUT(request, { params }) {
  const { id } = params;
  let vehicleData;
  try {
    vehicleData = await request.json();
  } catch (error) {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  // Remove o campo 'status_veiculo' se ele for enviado, para evitar erro no banco
  delete vehicleData.status_veiculo;

  try {
    const { data, error } = await supabaseAdmin
      .from('veiculos')
      .update(vehicleData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ message: "Veículo atualizado com sucesso!", data });
  } catch (error) {
    console.error(`Erro ao atualizar veículo ${id}:`, error.message);
    return NextResponse.json({ message: 'Erro ao atualizar o veículo.', details: error.message }, { status: 500 });
  }
}

// Função para EXCLUIR (DELETE) um veículo
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const { error } = await supabaseAdmin
            .from('veiculos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Veículo excluído com sucesso!' });
    } catch (error) {
        console.error(`Erro ao excluir veículo ${id}:`, error.message);
        return NextResponse.json({ message: 'Erro ao excluir o veículo.', details: error.message }, { status: 500 });
    }
}
