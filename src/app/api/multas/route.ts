import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para buscar todas as multas (GET)
export async function GET() {
  try {
    // 1. Busca todas as multas
    const { data: multas, error: multasError } = await supabaseAdmin
      .from('multas')
      .select('*')
      .order('data_infracao', { ascending: false });

    if (multasError) throw multasError;

    if (!multas || multas.length === 0) {
        return NextResponse.json([]);
    }

    // 2. Extrai os IDs únicos de veículos e condutores
    const veiculoIds = [...new Set(multas.map(m => m.veiculo_id).filter(id => id))];
    const condutorIds = [...new Set(multas.map(m => m.condutor_indicado_id).filter(id => id))];

    // 3. Busca os dados relacionados em chamadas separadas
    const { data: veiculos } = await supabaseAdmin
      .from('veiculos')
      .select('id, placa')
      .in('id', veiculoIds);

    const { data: condutores } = await supabaseAdmin
      .from('condutores')
      .select('id, nome_completo')
      .in('id', condutorIds);

    // 4. Cria mapas para uma combinação eficiente
    const veiculosMap = new Map(veiculos?.map(v => [v.id, v]) || []);
    const condutoresMap = new Map(condutores?.map(c => [c.id, c]) || []);

    // 5. Combina os dados
    const combinedData = multas.map(multa => ({
      ...multa,
      veiculos: veiculosMap.get(multa.veiculo_id) || null,
      condutores: condutoresMap.get(multa.condutor_indicado_id) || null,
    }));

    return NextResponse.json(combinedData);

  } catch (error) {
    console.error("Erro na API ao buscar multas:", error);
    return NextResponse.json({ error: 'Erro ao buscar multas no servidor.', details: error.message }, { status: 500 });
  }
}

// Função para criar uma nova multa (POST)
export async function POST(request) {
  let multaData;
  try {
    multaData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  if (!multaData.ait_numero || !multaData.veiculo_id || !multaData.data_infracao) {
    return NextResponse.json({ error: 'Campos obrigatórios (AIT, Veículo, Data da Infração) não foram preenchidos.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('multas')
      .insert([multaData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar multa:', error);
      if (error.code === '23505') {
          return NextResponse.json({ error: `O AIT de número "${multaData.ait_numero}" já está cadastrado.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar a multa no servidor.', details: error.message }, { status: 500 });
  }
}
