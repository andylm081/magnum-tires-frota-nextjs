import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET para buscar uma única multa com dados relacionados
export async function GET(request, { params }) {
    const { id } = params;
    try {
        // 1. Busca o registo principal da multa
        const { data: multa, error: multaError } = await supabaseAdmin
            .from('multas')
            .select('*')
            .eq('id', id)
            .single();

        if (multaError) {
            if (multaError.code === 'PGRST116') { // Erro padrão para "não encontrado"
                return NextResponse.json({ message: `Multa com ID ${id} não encontrada.` }, { status: 404 });
            }
            throw multaError; // Lança outros erros do banco de dados
        }

        // 2. Busca os dados do veículo relacionado, se existir
        let veiculoData = null;
        if (multa.veiculo_id) {
            // CORRIGIDO: .maybeSingle() retorna null em vez de um erro se o item não for encontrado.
            const { data } = await supabaseAdmin
                .from('veiculos')
                .select('placa')
                .eq('id', multa.veiculo_id)
                .maybeSingle(); 
            veiculoData = data;
        }

        // 3. Busca os dados do condutor relacionado, se existir
        let condutorData = null;
        if (multa.condutor_indicado_id) {
            // CORRIGIDO: .maybeSingle() retorna null em vez de um erro se o item não for encontrado.
            const { data } = await supabaseAdmin
                .from('condutores')
                .select('nome_completo')
                .eq('id', multa.condutor_indicado_id)
                .maybeSingle();
            condutorData = data;
        }

        // 4. Combina todos os dados num único objeto de resposta
        const responseData = {
            ...multa,
            veiculos: veiculoData,
            condutores: condutorData
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error(`Erro na API ao buscar multa ${id}:`, error);
        return NextResponse.json({ message: 'Erro ao buscar dados da multa.', details: error.message }, { status: 500 });
    }
}

// PUT para atualizar uma multa existente
export async function PUT(request, { params }) {
  const { id } = params;
  let multaData;
  try {
    multaData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }
  
  delete multaData.id; // Garante que o ID não seja atualizado

  try {
    const { data, error } = await supabaseAdmin
      .from('multas')
      .update(multaData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ message: "Multa atualizada com sucesso!", data });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao atualizar a multa.', details: error.message }, { status: 500 });
  }
}

// DELETE para uma multa
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const { error } = await supabaseAdmin
            .from('multas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Multa excluída com sucesso!' });
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao excluir a multa.', details: error.message }, { status: 500 });
    }
}
