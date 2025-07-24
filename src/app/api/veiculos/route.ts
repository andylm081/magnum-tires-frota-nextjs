import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para criar um novo veículo (POST)
export async function POST(request) {
  let vehicleData;
  try {
    vehicleData = await request.json();
  } catch (error) {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  // CORRIGIDO: 'status_veiculo' removido da lista de campos obrigatórios.
  const requiredFields = [
    'placa', 'renavam', 'chassi', 'marca', 'modelo', 'ano_fabricacao', 
    'ano_modelo', 'cor', 'estado_uf', 'cidade', 'empresa_responsavel', 
    'gestor_responsavel', 'centro_custo_veiculo', 
    'finalidade', 'locadora', 'data_disponibilizacao', 
    'data_prevista_devolucao', 'apoio_gestao'
  ];

  const missingFields = requiredFields.filter(field => !vehicleData[field]);

  if (missingFields.length > 0) {
    const missingFieldsMessage = `Validação falhou. Campos obrigatórios faltando: ${missingFields.join(', ')}`;
    console.error("API POST /api/veiculos: " + missingFieldsMessage);
    return NextResponse.json({ message: missingFieldsMessage }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('veiculos')
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      console.error("Erro do Supabase ao inserir veículo:", error);
      if (error.code === '23505') {
          return NextResponse.json({ message: `A placa "${vehicleData.placa}" já está cadastrada.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Veículo adicionado com sucesso!", data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor ao criar o veículo.', details: error.message }, { status: 500 });
  }
}

// Função para listar todos os veículos (GET)
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('veiculos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao buscar veículos.', details: error.message }, { status: 500 });
    }
}
