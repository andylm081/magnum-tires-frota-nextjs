// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  // 1) Protege a rota
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    // 2) Lê filtros de gráfico (não afetam KPIs)
    const url          = new URL(request.url);
    const ufFilter     = url.searchParams.get('uf') || undefined;
    const gestorFilter = url.searchParams.get('gestor') || undefined;

    // 3) Buscar dados completos para KPIs e dropdowns
    const [
      { data: allVeiculos = [], error: veicAllErr },
      { data: allMultas   = [], error: multasAllErr },
      { data: empresasData = [], error: empresasErr }
    ] = await Promise.all([
      supabaseAdmin
        .from('veiculos')
        .select('id, valor_mensal, empresa_responsavel, estado_uf, gestor_responsavel'),
      supabaseAdmin
        .from('multas')
        .select('veiculo_id, valor_original_multa'),
      supabaseAdmin
        .from('empresas')
        .select('razao_social, nome_fantasia, cidade'),
    ]);
    if (veicAllErr)    throw veicAllErr;
    if (multasAllErr)  throw multasAllErr;
    if (empresasErr)   throw empresasErr;

    // 4) Dropdowns (todas as UFs e gestores)
    const states   = Array.from(new Set(allVeiculos.map(v => v.estado_uf))).sort();
    const managers = Array.from(new Set(allVeiculos.map(v => v.gestor_responsavel))).filter(Boolean).sort();

    // 5) KPIs (baseados no dataset completo)
    const totalVeiculos      = allVeiculos.length;
    const custoTotalVeiculos = allVeiculos.reduce((sum, v) => sum + (v.valor_mensal || 0), 0);
    const totalMultas        = allMultas.reduce((sum, m) => sum + (m.valor_original_multa || 0), 0);
    const { count: totalCondutores = 0, error: condErr } = await supabaseAdmin
      .from('condutores')
      .select('id', { count: 'exact' })
      .eq('status_condutor', 'Ativo');
    if (condErr) throw condErr;

    // 6) Buscar só os veículos filtrados para os charts
    let chartVeicQ = supabaseAdmin
      .from('veiculos')
      .select('id, valor_mensal, empresa_responsavel');
    if (ufFilter)     chartVeicQ = chartVeicQ.eq('estado_uf', ufFilter);
    if (gestorFilter) chartVeicQ = chartVeicQ.eq('gestor_responsavel', gestorFilter);
    const { data: filteredVeiculos = [], error: veicFiltErr } = await chartVeicQ;
    if (veicFiltErr) throw veicFiltErr;

    // 7) Buscar multas apenas dos veículos filtrados
    const veicIds = filteredVeiculos.map(v => v.id);
    const { data: filteredMultas = [], error: multasFiltErr } = await supabaseAdmin
      .from('multas')
      .select('veiculo_id, valor_original_multa')
      .in('veiculo_id', veicIds);
    if (multasFiltErr) throw multasFiltErr;

    // 8) Mapa razao_social → "Nome Fantasia – Cidade"
    const empresaLabelMap = new Map<string,string>();
    const defaultLabel = 'Não especificada';
    for (const e of empresasData) {
      const key   = e.razao_social;
      const label = `${e.nome_fantasia ?? key} – ${e.cidade ?? ''}`.trim();
      empresaLabelMap.set(key, label);
    }

    // 9) Agrupar filteredVeiculos e filteredMultas por empresa
    const veiculosPorUnidade: Record<string, number>      = {};
    const custoVeiculoPorUnidade: Record<string, number> = {};
    const custoMultaPorUnidade: Record<string, number>   = {};

    for (const v of filteredVeiculos) {
      const raiz  = v.empresa_responsavel || defaultLabel;
      const label = empresaLabelMap.get(raiz) || raiz;
      veiculosPorUnidade[label]      = (veiculosPorUnidade[label]      || 0) + 1;
      custoVeiculoPorUnidade[label]  = (custoVeiculoPorUnidade[label]  || 0) + (v.valor_mensal || 0);
    }

    for (const m of filteredMultas) {
      const veic = filteredVeiculos.find(v => v.id === m.veiculo_id);
      const raiz = veic?.empresa_responsavel || defaultLabel;
      const label = empresaLabelMap.get(raiz) || raiz;
      custoMultaPorUnidade[label] = (custoMultaPorUnidade[label] || 0) + (m.valor_original_multa || 0);
    }

    // 10) Montar e retornar JSON
    return NextResponse.json({
      states,
      managers,
      kpi: {
        totalVeiculos,
        custoTotalVeiculos,
        totalMultas,
        totalCondutores,
      },
      charts: {
        veiculosPorUnidade: {
          labels: Object.keys(veiculosPorUnidade),
          data:   Object.values(veiculosPorUnidade),
        },
        custoVeiculoPorUnidade: {
          labels: Object.keys(custoVeiculoPorUnidade),
          data:   Object.values(custoVeiculoPorUnidade),
        },
        custoMultaPorUnidade: {
          labels: Object.keys(custoMultaPorUnidade),
          data:   Object.values(custoMultaPorUnidade),
        },
      },
    });
  } catch (error: any) {
    console.error('Erro na API do Dashboard:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar dados para o dashboard.', details: error.message },
      { status: 500 }
    );
  }
}
