// src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Adiciona a propriedade 'Chart' ao objeto Window para o TypeScript
declare global {
  interface Window {
    Chart: any;
  }
}

// Ícones
const IconCarro = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>;
const IconCusto = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 2-3.5 3.67 0 2.33 1.55 3.47 3.53 3.96 2.26.56 3.03 1.18 3.03 2.17 0 1.09-1.02 1.83-2.83 1.83-1.92 0-2.66-.8-2.73-2.03H6.2c.13 2.05 1.77 3.42 3.8 3.81V21h3v-2.15c1.95-.37 3.5-1.98 3.5-4.17 0-2.92-2.06-3.92-4.2-4.74z"/></svg>;
const IconMulta = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>;
const IconCondutor = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>;

export default function DashboardPage() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const [activeChart, setActiveChart] = useState('qtd_veiculos');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const getSampleData = () => ({
    kpi: { totalVeiculos: 2, custoTotalVeiculos: 1555.54, totalMultas: 522.22, totalCondutores: 1 },
    charts: {
      veiculosPorUnidade: { labels: ['Unidade Principal'], data: [2] },
      custoVeiculoPorUnidade: { labels: ['Unidade Principal'], data: [1555.54] },
      custoMultaPorUnidade: { labels: ['Unidade Principal'], data: [522.22] },
    },
  });

  const initializeChart = () => {
      if (!dashboardData || !chartRef.current || !window.Chart) return;
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      
      let chartConfig = { labels: [], data: [], label: '' };
      switch (activeChart) {
          case 'qtd_veiculos': chartConfig = { ...dashboardData.charts.veiculosPorUnidade, label: 'Quantidade de Veículos' }; break;
          case 'custo_veiculo': chartConfig = { ...dashboardData.charts.custoVeiculoPorUnidade, label: 'Custo de Veículos (R$)' }; break;
          case 'custo_multa': chartConfig = { ...dashboardData.charts.custoMultaPorUnidade, label: 'Custo de Multas (R$)' }; break;
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      chartInstanceRef.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
              labels: chartConfig.labels,
              datasets: [{
                  label: chartConfig.label,
                  data: chartConfig.data,
                  backgroundColor: 'rgba(217, 37, 45, 0.7)',
                  borderColor: 'rgba(217, 37, 45, 1)',
                  borderWidth: 1
              }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
  };

  useEffect(() => {
    setIsClient(true);
    setDashboardData(getSampleData());
    setIsLoading(false);

    // Carregar o script do Chart.js se ele não existir
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        script.onload = () => {
            // Re-chamar a inicialização após o script carregar
            initializeChart();
        };
        document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Apenas redesenha o gráfico quando os dados ou o tipo de gráfico mudam
    initializeChart();
  }, [activeChart, dashboardData, isClient]);

  if (!isClient || isLoading) {
    return <main className="main-content-area"><div className="card">A carregar dashboard...</div></main>;
  }

  if (error) {
    return <main className="main-content-area"><div className="card form-feedback-message error">{error}</div></main>;
  }

  return (
    <>
      <main className="main-content-area">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        
        <div className="card">
          <h2 className="section-title">Acessos Rápidos</h2>
          <div className="form-grid cols-4">
            <Link href="/veiculos/novo" className="btn btn-primary">Novo Veículo</Link>
            <Link href="/condutores/novo" className="btn btn-primary">Novo Condutor</Link>
            <Link href="/multas/novo" className="btn btn-primary">Registar Multa</Link>
            <Link href="/empresas/novo" className="btn btn-primary">Nova Empresa</Link>
          </div>
        </div>
        
        <div className="kpi-cards-container">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Total de Veículos</span>
              <div className="kpi-card-icon"><IconCarro /></div>
            </div>
            <p className="kpi-card-value">{dashboardData?.kpi.totalVeiculos || 0}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Custo Mensal Total</span>
              <div className="kpi-card-icon"><IconCusto /></div>
            </div>
            <p className="kpi-card-value">{(dashboardData?.kpi.custoTotalVeiculos || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Valor em Multas</span>
              <div className="kpi-card-icon"><IconMulta /></div>
            </div>
            <p className="kpi-card-value">{(dashboardData?.kpi.totalMultas || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Total de Condutores</span>
              <div className="kpi-card-icon"><IconCondutor /></div>
            </div>
            <p className="kpi-card-value">{dashboardData?.kpi.totalCondutores || 0}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="chart-header">
            <h2 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Análise por Unidade</h2>
            <div className="chart-nav-pills">
              <button className={`btn ${activeChart === 'custo_veiculo' ? 'active' : ''}`} onClick={() => setActiveChart('custo_veiculo')}>Custo (Veículos)</button>
              <button className={`btn ${activeChart === 'custo_multa' ? 'active' : ''}`} onClick={() => setActiveChart('custo_multa')}>Custo (Multas)</button>
              <button className={`btn ${activeChart === 'qtd_veiculos' ? 'active' : ''}`} onClick={() => setActiveChart('qtd_veiculos')}>Quantidade</button>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </main>
      <footer className="app-footer">
          &copy; {new Date().getFullYear()} Magnum Tires. Todos os direitos reservados.
      </footer>
    </>
  );
}