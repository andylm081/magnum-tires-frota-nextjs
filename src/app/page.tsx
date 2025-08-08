'use client'

import Chart from 'chart.js/auto'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardFilters from '@/components/DashboardFilters'
import ChartNavPills, { ChartKey } from '@/components/ChartNavPills'

// Ícones
const IconCarro = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
)
const IconCusto = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 2-3.5 3.67 0 2.33 1.55 3.47 3.53 3.96 2.26.56 3.03 1.18 3.03 2.17 0 1.09-1.02 1.83-2.83 1.83-1.92 0-2.66-.8-2.73-2.03H6.2c.13 2.05 1.77 3.42 3.8 3.81V21h3v-2.15c1.95-.37 3.5-1.98 3.5-4.17 0-2.92-2.06-3.92-4.2-4.74z"/>
  </svg>
)
const IconMulta = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
)
const IconCondutor = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
  </svg>
)

export default function DashboardPage() {
  // 1) Hooks estáveis
  const { data: session, status } = useSession()
  const router = useRouter()

  const [states, setStates]                   = useState<string[]>([])
  const [managers, setManagers]               = useState<string[]>([])
  const [selectedUf, setSelectedUf]           = useState<string>('')
  const [selectedManager, setSelectedManager] = useState<string>('')

  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [activeChart, setActiveChart] = useState<ChartKey>('veiculosPorUnidade')

  // 2) redirecionamento
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 3) fetcher
  const fetchAllDashboardData = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      let url = '/api/dashboard?'
      if (selectedUf)      url += `uf=${encodeURIComponent(selectedUf)}&`
      if (selectedManager) url += `gestor=${encodeURIComponent(selectedManager)}&`
      const res = await fetch(url, { credentials:'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message||'Erro desconhecido')
      setDashboardData(json)
      setStates(json.states)
      setManagers(json.managers)
    } catch (err:any) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedUf, selectedManager])

  // 4) inicial + filtros
  useEffect(() => {
    if (status==='authenticated') fetchAllDashboardData()
  }, [status, fetchAllDashboardData])

  // 5) chart
  useEffect(() => {
    if (!dashboardData || !chartRef.current) return
    chartInstance.current?.destroy()
    const raw = dashboardData.charts[activeChart]
    const labelMap = {
      veiculosPorUnidade:     'Quantidade de Veículos',
      custoVeiculoPorUnidade: 'Custo de Veículos (R$)',
      custoMultaPorUnidade:   'Custo de Multas (R$)',
    }
    const labels = raw.labels.map((l:string)=>
      l.split(' – ').length>1? l.split(' – ') : [l]
    )
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    chartInstance.current = new Chart(ctx, {
      type:'bar',
      data:{ labels, datasets:[{
        label: labelMap[activeChart],
        data: raw.data,
        backgroundColor:'rgba(217,37,45,0.5)',
        borderColor:'rgba(217,37,45,1)',
        borderWidth:1,
        borderRadius:4,
        barPercentage:0.6
      }]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        layout:{padding:20},
        plugins:{ legend:{display:false}, tooltip:{padding:12, titleFont:{size:14}, bodyFont:{size:12}} },
        scales:{
          x:{grid:{display:false},ticks:{autoSkip:true,maxRotation:0}},
          y:{beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'},ticks:{
            callback:(v)=>
              typeof v==='number' && activeChart!=='veiculosPorUnidade'
                ? v>=1e6? `R$ ${(v/1e6).toFixed(1)}M`
                  : v>=1e3? `R$ ${(v/1e3).toFixed(0)}k`
                  : `R$ ${v.toLocaleString('pt-BR')}`
                : v
          }}
        }
      }
    })
  },[activeChart,dashboardData])

  // 6) render
  if (status!=='authenticated') return null

  return (
    <main className="main-content-area space-y-6 p-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}

      <div className="card">
        <h2 className="section-title">Acessos Rápidos</h2>
        <div className="form-grid cols-4">
          <Link href="/veiculos/novo" className="btn btn-primary">Novo Veículo</Link>
          <Link href="/condutores/novo" className="btn btn-primary">Novo Condutor</Link>
          <Link href="/multas/novo" className="btn btn-primary">Nova Multa</Link>
          <Link href="/empresas/novo" className="btn btn-primary">Nova Empresa</Link>
        </div>
      </div>

      <div className="kpi-cards-container grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label:'Total de Veículos', icon:<IconCarro/>, value:dashboardData?.kpi.totalVeiculos },
          { label:'Custo Mensal Total', icon:<IconCusto/>, value:dashboardData?.kpi.custoTotalVeiculos,
            format:(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) },
          { label:'Valor em Multas', icon:<IconMulta/>, value:dashboardData?.kpi.totalMultas,
            format:(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) },
          { label:'Total de Condutores', icon:<IconCondutor/>, value:dashboardData?.kpi.totalCondutores },
        ].map(({label,icon,value,format})=>(
          <div key={label} className="kpi-card bg-white p-4 rounded-md shadow flex flex-col">
            <div className="kpi-card-header flex items-center justify-between mb-2">
              <span className="kpi-card-label text-sm text-gray-500">{label}</span>
              <div className="kpi-card-icon">{icon}</div>
            </div>
            <div className="kpi-card-value flex justify-center items-center h-16">
              {isLoading
                ? <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"/>
                : value===0
                  ? <span className="text-gray-400">Sem resultados</span>
                  : <span className="text-2xl font-bold">{format?format(value):value}</span>
              }
            </div>
          </div>
        ))}
      </div>

      <DashboardFilters
        states={states}
        managers={managers}
        selectedUf={selectedUf}
        selectedManager={selectedManager}
        onChangeUf={setSelectedUf}
        onChangeManager={setSelectedManager}
      />

      <div className="card">
        <div className="chart-header flex items-center justify-between flex-wrap gap-4 p-4">
          <h2 className="text-lg font-semibold m-0">Análise por Unidade</h2>
          <ChartNavPills active={activeChart} onChange={setActiveChart} />
        </div>
        <div className="relative" style={{ height: 350 }}>
          {isLoading
            ? <div className="absolute inset-0 bg-gray-200 animate-pulse"/>
            : dashboardData.charts[activeChart].data.length===0
              ? <div className="h-full flex items-center justify-center text-gray-400">Sem dados para o gráfico</div>
              : <canvas ref={chartRef} className="absolute inset-0"/>
          }
        </div>
      </div>

      <footer className="app-footer mt-auto bg-transparent border-none p-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Magnum Tires. Todos os direitos reservados.
      </footer>
    </main>
  )
}
