import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função auxiliar para obter a data atual no formato YYYY-MM-DD
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Handler para requisições POST (Adicionar novo condutor)
export async function POST(request) {
  let novoCondutorData;
  try {
    novoCondutorData = await request.json();
  } catch (e) {
    return NextResponse.json({ message: "Dados inválidos ou erro no formato JSON.", error: e.message }, { status: 400 });
  }

  // CORRIGIDO: O nome do campo foi ajustado para 'cnh_numero' para corresponder ao formulário
  const requiredFields = {
    nome_completo: "Nome Completo",
    cpf: "CPF",
    cnh_numero: "Número da CNH",
    validade_cnh: "Validade da CNH",
  };

  for (const field in requiredFields) {
    if (!novoCondutorData[field] || (typeof novoCondutorData[field] === 'string' && !novoCondutorData[field].trim())) {
      const errorMessage = `Campo obrigatório ausente ou vazio: ${requiredFields[field]}.`;
      console.error("API POST /api/condutores: " + errorMessage);
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }
  }

  // Validação de CNH vencida
  if (novoCondutorData.validade_cnh) {
    const hojeString = getTodayDateString();
    if (novoCondutorData.validade_cnh < hojeString) {
      const friendlyDate = new Date(novoCondutorData.validade_cnh + 'T00:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC'});
      return NextResponse.json({ message: `A CNH com validade em ${friendlyDate} está vencida.` }, { status: 400 });
    }
  }
  
  const dadosParaSalvar = { ...novoCondutorData };
  Object.keys(dadosParaSalvar).forEach(key => {
    if (dadosParaSalvar[key] === '') {
        dadosParaSalvar[key] = null;
    }
  });

  try {
    const { data, error } = await supabaseAdmin
      .from('condutores')
      .insert([dadosParaSalvar])
      .select()
      .single();

    if (error) {
      console.error("API POST /api/condutores: Erro Supabase ao INSERIR:", error);
      if (error.code === '23505') { // unique_violation
         let friendlyMessage = "Erro: CPF ou Número da CNH já cadastrado.";
         if (error.message.includes('cpf')) friendlyMessage = "Erro: CPF já cadastrado.";
         else if (error.message.includes('cnh_numero')) friendlyMessage = "Erro: Número da CNH já cadastrado.";
         return NextResponse.json({ message: friendlyMessage, details: error.message }, { status: 409 });
      }
      return NextResponse.json({ message: "Erro ao salvar condutor no banco de dados.", details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Condutor adicionado com sucesso!", condutor: data }, { status: 201 });

  } catch (e) {
    console.error("API POST /api/condutores: Erro GERAL:", e);
    return NextResponse.json({ message: "Erro interno ao processar requisição.", error: e.message }, { status: 500 });
  }
}

// Handler GET (Listar todos os condutores)
export async function GET(request) {
  try {
    const { data: condutores, error } = await supabaseAdmin
      .from('condutores')
      .select('*')
      .order('nome_completo', { ascending: true });

    if (error) {
      console.error("API GET /api/condutores: Erro Supabase:", error);
      return NextResponse.json({ message: "Erro ao buscar condutores.", details: error.message }, { status: 500 });
    }
    return NextResponse.json(condutores || []);
  } catch (e) {
    console.error("API GET /api/condutores: Erro geral:", e);
    return NextResponse.json({ message: "Erro interno ao buscar condutores.", error: e.message }, { status: 500 });
  }
}
