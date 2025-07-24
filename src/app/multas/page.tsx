// src/app/multas/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal'; 

// Ícones
const IconDetalhes   = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>;
const IconEditar     = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconExcluir    = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconFilter     = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>;
const IconClearFilter= () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>;
const IconPlus       = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconCusto      = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 2-3.5 3.67 0 2.33 1.55 3.47 3.53 3.96 2.26.56 3.03 1.18 3.03 2.17 0 1.09-1.02 1.83-2.83 1.83-1.92 0-2.66-.8-2.73-2.03H6.2c.13 2.05 1.77 3.42 3.8 3.81V21h3v-2.15c1.95-.37 3.5-1.98 3.5-4.17 0-2.92-2.06-3.92-4.2-4.74z"/></svg>;
const IconMulta      = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>;

// Formatações
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset).toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getStatusClass = (status) => {
  if (!status) return 'status-inativa';
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return {
    'pendente': 'status-pendente',
    'indicacao-realizada': 'status-indicacao-realizada',
    'nao-houve-indicacao': 'status-prazo-expirado',
    'aguardando-fatura': 'status-em-andamento',
    'aguardando-pagamento': 'status-pendente',
    'paga': 'status-paga',
    'vencida': 'status-vencida',
    'cancelada': 'status-cancelada'
  }[key] || 'status-inativa';
};

const statusIndicacaoOptions = ['Pendente', 'Indicação Realizada', 'Não Houve Indicação'];
const statusPagamentoOptions  = ['Aguardando Fatura', 'Aguardando Pagamento', 'Paga', 'Vencida', 'Cancelada'];

export default function MultasPage() {
  const [allMultas, setAllMultas]           = useState([]);
  const [filteredMultas, setFilteredMultas] = useState([]);
  const [veiculos, setVeiculos]             = useState([]);
  const [condutores, setCondutores]         = useState([]);
  const [filters, setFilters]               = useState({ ait:'', veiculoId:'', condutorId:'', statusIndicacao:'', statusPagamento:'', dataInicio:'', dataFim:'' });
  const [error, setError]                   = useState(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [isConfirmModalOpen, setModalOpen]  = useState(false);
  const [itemToDelete, setItemToDelete]     = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mR, vR, cR] = await Promise.all([fetch('/api/multas'), fetch('/api/veiculos'), fetch('/api/condutores')]);
      if (!mR.ok || !vR.ok || !cR.ok) throw new Error();
      const [multasData, veicData, condData] = await Promise.all([mR.json(), vR.json(), cR.json()]);
      setAllMultas(multasData);
      setFilteredMultas(multasData);
      setVeiculos(veicData);
      setCondutores(condData);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    let data = [...allMultas];
    if (filters.ait)             data = data.filter(m => m.ait_numero.toLowerCase().includes(filters.ait.toLowerCase()));
    if (filters.veiculoId)       data = data.filter(m => m.veiculos?.id === filters.veiculoId);
    if (filters.condutorId)       data = data.filter(m => m.condutores?.id === filters.condutorId);
    if (filters.statusIndicacao) data = data.filter(m => m.status_indicacao === filters.statusIndicacao);
    if (filters.statusPagamento)  data = data.filter(m => m.status_pagamento_multa === filters.statusPagamento);
    if (filters.dataInicio)      data = data.filter(m => new Date(m.data_infracao) >= new Date(filters.dataInicio));
    if (filters.dataFim)         data = data.filter(m => new Date(m.data_infracao) <= new Date(filters.dataFim));
    setFilteredMultas(data);
  }, [filters, allMultas]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };
  const handleClearFilters = () => {
    setFilters({ ait:'', veiculoId:'', condutorId:'', statusIndicacao:'', statusPagamento:'', dataInicio:'', dataFim:'' });
  };
  const handleDelete = (id, identifier) => {
    setItemToDelete({ id, identifier });
    setModalOpen(true);
  };
  const executeDelete = async () => {
    if (!itemToDelete) return;
    setModalOpen(false);
    try {
      const res = await fetch(`/api/multas/${itemToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchData();
    } catch (err) {
      setError('Falha ao excluir.');
    } finally {
      setItemToDelete(null);
    }
  };

  const totalMultasFiltradas = filteredMultas.length;
  const valorTotalFiltrado   = filteredMultas.reduce((acc, m) => acc + (m.valor_original_multa || 0), 0);

  return (
    <div className="main-content-area">
      <header className="page-header">
        <h1 className="page-title">Relatório de Multas</h1>
        <div>
          <Link href="/multas/novo" className="btn btn-primary">
            <IconPlus /> Registrar Infração
          </Link>
        </div>
      </header>

      <div className="card">
        <div
          className="filters-section"
          style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--magnum-border-light)' }}
        >
          <h2 className="filters-title" style={{ marginBottom: 'var(--space-4)' }}>
            <IconFilter /> Filtros
          </h2>
          <div className="form-grid cols-4">
            <div className="form-item">
              <label htmlFor="ait">Buscar por AIT</label>
              <input
                type="text"
                id="ait"
                name="ait"
                value={filters.ait}
                onChange={handleFilterChange}
                placeholder="Digite o AIT..."
              />
            </div>
            <div className="form-item">
              <label htmlFor="veiculoId">Placa</label>
              <select
                id="veiculoId"
                name="veiculoId"
                value={filters.veiculoId}
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                {veiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.placa}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="condutorId">Condutor</label>
              <select
                id="condutorId"
                name="condutorId"
                value={filters.condutorId}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {condutores.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome_completo}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="statusIndicacao">Status da Indicação</label>
              <select
                id="statusIndicacao"
                name="statusIndicacao"
                value={filters.statusIndicacao}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {statusIndicacaoOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="statusPagamento">Status do Pagamento</label>
              <select
                id="statusPagamento"
                name="statusPagamento"
                value={filters.statusPagamento}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {statusPagamentoOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="dataInicio">Data de Início</label>
              <input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={filters.dataInicio}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="dataFim">Data de Fim</label>
              <input
                type="date"
                id="dataFim"
                name="dataFim"
                value={filters.dataFim}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filters-actions">
            <button onClick={handleClearFilters} className="btn btn-secondary">
              <IconClearFilter /> Limpar Filtros
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div
          className="kpi-cards-container"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)', padding: 'var(--space-5) 0' }}
        >
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Total de Multas (Filtro)</span>
              <div className="kpi-card-icon"><IconMulta /></div>
            </div>
            <p className="kpi-card-value">{totalMultasFiltradas}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-label">Valor Total (Filtro)</span>
              <div className="kpi-card-icon"><IconCusto /></div>
            </div>
            <p className="kpi-card-value">{formatCurrency(valorTotalFiltrado)}</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>AIT</th>
                <th>Placa</th>
                <th>Condutor</th>
                <th>Data da Infração</th>
                <th>Status Indicação</th>
                <th>Status Pagamento</th>
                <th>Valor</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Carregando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    <p style={{ color: 'var(--magnum-red-status)', fontWeight: 600 }}>
                      {error}
                    </p>
                  </td>
                </tr>
              ) : filteredMultas.length > 0 ? (
                filteredMultas.map((multa) => (
                  <tr key={multa.id}>
                    <td>{multa.ait_numero}</td>
                    <td>{multa.veiculos?.placa || 'N/A'}</td>
                    <td>{multa.condutores?.nome_completo || 'Não indicado'}</td>
                    <td>{formatDate(multa.data_infracao)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(multa.status_indicacao)}`}>
                        {multa.status_indicacao}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(multa.status_pagamento_multa)}`}>
                        {multa.status_pagamento_multa}
                      </span>
                    </td>
                    <td>{formatCurrency(multa.valor_original_multa)}</td>
                    <td className="actions-cell" style={{ textAlign: 'right' }}>
                      <Link href={`/multas/${multa.id}`} className="btn-icon info">
                        <IconDetalhes />
                      </Link>
                      <Link href={`/multas/${multa.id}/editar`} className="btn-icon warning">
                        <IconEditar />
                      </Link>
                      <button
                        onClick={() => handleDelete(multa.id, multa.ait_numero)}
                        className="btn-icon"
                      >
                        <IconExcluir />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Nenhuma multa encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={executeDelete}
        title="Confirmar Exclusão de Multa"
        message={
          itemToDelete
            ? `Tem certeza que deseja excluir a multa AIT ${itemToDelete.identifier}?`
            : ''
        }
        confirmButtonText="Sim, Excluir"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}
