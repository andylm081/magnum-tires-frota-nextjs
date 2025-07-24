import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para criar uma nova empresa (POST)
export async function POST(request) {
  let empresaData;
  try {
    empresaData = await request.json();
  } catch (error) {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  // Validação de campos obrigatórios no backend
  const requiredFields = ['razao_social', 'cnpj'];
  const missingFields = requiredFields.filter(field => !empresaData[field]);

  if (missingFields.length > 0) {
    const errorMessage = `Validação falhou. Campos obrigatórios faltando: ${missingFields.join(', ')}`;
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }

  // CORRIGIDO: Prepara o objeto de dados para garantir que apenas os campos corretos sejam enviados
  const dataToInsert = {
    razao_social: empresaData.razao_social,
    nome_fantasia: empresaData.nome_fantasia,
    cnpj: empresaData.cnpj,
    inscricao_estadual: empresaData.inscricao_estadual,
    inscricao_municipal: empresaData.inscricao_municipal,
    cep: empresaData.cep,
    logradouro: empresaData.logradouro,
    numero: empresaData.numero,
    complemento: empresaData.complemento,
    bairro: empresaData.bairro,
    cidade: empresaData.cidade,
    uf: empresaData.uf,
    observacoes: empresaData.observacoes,
    anexos: empresaData.anexos || [], // Garante que a coluna de anexos seja um array
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .insert([dataToInsert]) // Usa o objeto de dados preparado
      .select()
      .single();

    if (error) {
      console.error("Erro do Supabase ao inserir empresa:", error);
      if (error.code === '23505') { // Conflito de CNPJ único
          return NextResponse.json({ message: `O CNPJ "${empresaData.cnpj}" já está cadastrado.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Empresa adicionada com sucesso!", data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno do servidor ao criar a empresa.', details: error.message }, { status: 500 });
  }
}

// Função para listar todas as empresas (GET)
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('empresas')
            .select('*')
            .order('razao_social', { ascending: true });

        if (error) {
            throw error;
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao buscar empresas.', details: error.message }, { status: 500 });
    }
}
