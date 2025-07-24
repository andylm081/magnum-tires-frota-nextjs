import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função auxiliar para adicionar dias a uma data
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Função para formatar a data para o padrão YYYY-MM-DD
const toISODateString = (date) => {
  return date.toISOString().split('T')[0];
};

export async function GET() {
  try {
    const today = new Date();
    const todayString = toISODateString(today);
    const thirtyDaysFromNow = toISODateString(addDays(today, 30));
    const sevenDaysFromNow = toISODateString(addDays(today, 7));

    let allNotifications = [];

    // 1. Verificar CNHs a vencer nos próximos 30 dias
    const { data: cnhs, error: cnhsError } = await supabaseAdmin
      .from('condutores')
      .select('id, nome_completo, validade_cnh')
      .gte('validade_cnh', todayString)
      .lte('validade_cnh', thirtyDaysFromNow);

    if (cnhsError) throw new Error(`Erro ao buscar CNHs: ${cnhsError.message}`);

    cnhs.forEach(c => {
      allNotifications.push({
        id: `cnh-${c.id}`,
        type: 'Vencimento de CNH',
        description: `A CNH do condutor ${c.nome_completo} vence em breve.`,
        due_date: c.validade_cnh,
        status: 'Atenção',
        link: `/condutores/${c.id}`
      });
    });

    // 2. Verificar Multas a vencer nos próximos 7 dias
    const { data: multas, error: multasError } = await supabaseAdmin
      .from('multas')
      .select('id, ait_numero, data_vencimento_multa')
      .neq('status_pagamento_multa', 'Paga')
      .gte('data_vencimento_multa', todayString)
      .lte('data_vencimento_multa', sevenDaysFromNow);

    if (multasError) throw new Error(`Erro ao buscar multas: ${multasError.message}`);
    
    multas.forEach(m => {
      allNotifications.push({
        id: `multa-${m.id}`,
        type: 'Pagamento de Multa',
        description: `A multa AIT ${m.ait_numero} vence em breve.`,
        due_date: m.data_vencimento_multa,
        status: 'Urgente',
        link: `/multas/${m.id}`
      });
    });

    // 3. Verificar Contratos de veículos a terminar nos próximos 30 dias
    const { data: veiculos, error: veiculosError } = await supabaseAdmin
      .from('veiculos')
      .select('id, placa, data_prevista_devolucao')
      .gte('data_prevista_devolucao', todayString)
      .lte('data_prevista_devolucao', thirtyDaysFromNow);

    if (veiculosError) throw new Error(`Erro ao buscar veículos: ${veiculosError.message}`);

    veiculos.forEach(v => {
      allNotifications.push({
        id: `veiculo-${v.id}`,
        type: 'Fim de Contrato',
        description: `O contrato do veículo ${v.placa} termina em breve.`,
        due_date: v.data_prevista_devolucao,
        status: 'Atenção',
        link: `/veiculos/${v.id}`
      });
    });
    
    // Ordena as notificações por data de referência
    allNotifications.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    return NextResponse.json(allNotifications);

  } catch (error) {
    console.error("Erro na API de Notificações:", error);
    return NextResponse.json({ error: 'Erro ao gerar notificações.', details: error.message }, { status: 500 });
  }
}
