// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    // 1) Buscar todos os veículos
    const { data: veiculosData, error: veiculosError } = await supabaseAdmin
      .from('veiculos')
      .select('*')
    if (veiculosError) throw veiculosError

    // 2) Buscar todas as multas
    const { data: multasData, error: multasError } = await supabaseAdmin
      .from('multas')
      .select('*')
    if (multasError) throw multasError

    // 3) Contar condutores ativos (usando count exato)
    const {
      data: _,
      count: totalCondutores,
      error: condutoresError,
    } = await supabaseAdmin
      .from('condutores')
      .select('id', { count: 'exact' })
      .eq('status_condutor', 'Ativo')
    if (condutoresError) throw condutoresError

    // Mapa de veículo → unidade
    const veiculoUnidadeMap = new Map<string, string>(
      (veiculosData || []).map((v: any) => [
        String(v.id),
        v.unidade || 'Não especificada',
      ])
    )

    // KPIs
    const totalVeiculos = (veiculosData || []).length
    const custoTotalVeiculos = (veiculosData || []).reduce(
      (sum: number, v: any) => sum + (v.valor_mensal || 0),
      0
    )
    const totalMultas = (multasData || []).reduce(
      (sum: number, m: any) => sum + (m.valor_original_multa || 0),
      0
    )

    // Gráfico: quantidade de veículos por unidade
    const veiculosPorUnidade: Record<string, number> = {}
    ;(veiculosData || []).forEach((v: any) => {
      const unidade = v.unidade || 'Não especificada'
      veiculosPorUnidade[unidade] = (veiculosPorUnidade[unidade] || 0) + 1
    })

    // Gráfico: custo de veículos por unidade
    const custoVeiculoPorUnidade: Record<string, number> = {}
    ;(veiculosData || []).forEach((v: any) => {
      const unidade = v.unidade || 'Não especificada'
      custoVeiculoPorUnidade[unidade] =
        (custoVeiculoPorUnidade[unidade] || 0) + (v.valor_mensal || 0)
    })

    // Gráfico: custo de multas por unidade
    const custoMultaPorUnidade: Record<string, number> = {}
    ;(multasData || []).forEach((m: any) => {
      const unidade =
        veiculoUnidadeMap.get(String(m.veiculo_id)) || 'Não especificada'
      custoMultaPorUnidade[unidade] =
        (custoMultaPorUnidade[unidade] || 0) + (m.valor_original_multa || 0)
    })

    const dashboardData = {
      kpi: {
        totalVeiculos,
        custoTotalVeiculos,
        totalMultas,
        totalCondutores: totalCondutores || 0,
      },
      charts: {
        veiculosPorUnidade: {
          labels: Object.keys(veiculosPorUnidade),
          data: Object.values(veiculosPorUnidade),
        },
        custoVeiculoPorUnidade: {
          labels: Object.keys(custoVeiculoPorUnidade),
          data: Object.values(custoVeiculoPorUnidade),
        },
        custoMultaPorUnidade: {
          labels: Object.keys(custoMultaPorUnidade),
          data: Object.values(custoMultaPorUnidade),
        },
      },
    }

    return NextResponse.json(dashboardData)
  } catch (error: any) {
    console.error('Erro na API do Dashboard:', error)
    return NextResponse.json(
      {
        message: 'Erro ao buscar dados para o dashboard.',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
