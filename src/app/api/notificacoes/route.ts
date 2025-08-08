// src/app/notificacoes/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Helper: adiciona dias a uma Date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper: formata Date como YYYY-MM-DD
function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Paginação
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1',  10))
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    const offset = (page - 1) * limit

    const today = new Date()
    const todayStr = toISODateString(today)
    const in7Days  = toISODateString(addDays(today, 7))
    const in30Days = toISODateString(addDays(today, 30))

    type Notif = {
      id: string
      type: string
      description: string
      due_date?: string
      status: 'Pendente' | 'Urgente' | 'Atenção'
      link?: string
    }

    const all: Notif[] = []

    // 1) CNHs vencendo em até 30 dias → Atenção
    const { data: cnhs, error: errCnh } = await supabaseAdmin
      .from('condutores')
      .select('id, nome_completo, validade_cnh')
      .gte('validade_cnh', todayStr)
      .lte('validade_cnh', in30Days)

    if (errCnh) throw new Error(`CNHs: ${errCnh.message}`)
    cnhs?.forEach(c => {
      all.push({
        id: `cnh-${c.id}`,
        type: 'Vencimento de CNH',
        description: `A CNH de ${c.nome_completo} vence em ${c.validade_cnh}.`,
        due_date: c.validade_cnh,
        status: 'Atenção',
        link: `/condutores/${c.id}`
      })
    })

    // 2) Multas vencendo em até 7 dias e não pagas → Urgente
    const { data: multas, error: errMulta } = await supabaseAdmin
      .from('multas')
      .select('id, ait_numero, data_vencimento_multa, status_pagamento_multa')
      .neq('status_pagamento_multa', 'Paga')
      .gte('data_vencimento_multa', todayStr)
      .lte('data_vencimento_multa', in7Days)

    if (errMulta) throw new Error(`Multas: ${errMulta.message}`)
    multas?.forEach(m => {
      all.push({
        id: `multa-${m.id}`,
        type: 'Pagamento de Multa',
        description: `Multa AIT ${m.ait_numero} vence em ${m.data_vencimento_multa}.`,
        due_date: m.data_vencimento_multa,
        status: 'Urgente',
        link: `/multas/${m.id}`
      })
    })

    // 3) Fim de contrato de veículo em até 30 dias → Atenção
    const { data: veics, error: errVeic } = await supabaseAdmin
      .from('veiculos')
      .select('id, placa, data_prevista_devolucao')
      .gte('data_prevista_devolucao', todayStr)
      .lte('data_prevista_devolucao', in30Days)

    if (errVeic) throw new Error(`Veículos: ${errVeic.message}`)
    veics?.forEach(v => {
      all.push({
        id: `veic-${v.id}`,
        type: 'Fim de Contrato',
        description: `Contrato do veículo ${v.placa} termina em ${v.data_prevista_devolucao}.`,
        due_date: v.data_prevista_devolucao,
        status: 'Atenção',
        link: `/veiculos/${v.id}`
      })
    })

    // Ordena por due_date asc
    all.sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

    // Pagina o resultado
    const paginated = all.slice(offset, offset + limit)

    // Monta resposta com metadados de paginação
    const result = {
      data: paginated,
      meta: {
        total: all.length,
        page,
        limit,
        pages: Math.ceil(all.length / limit),
      },
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        // Cache por 60s, stale-while-revalidate por 120s
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (err: any) {
    console.error('Erro na API de Notificações:', err)
    return NextResponse.json(
      { error: 'Não foi possível carregar notificações.', details: err.message },
      { status: 500 }
    )
  }
}
