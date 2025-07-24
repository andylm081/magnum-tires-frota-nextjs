// src/app/condutores/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal'; 
import { supabase } from '@/lib/supabaseClient';

// Ícones
const IconDetalhes = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>;
const IconEditar = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconExcluir = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>;
const IconClearFilter = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

const statusOptions = ['Ativo', 'Férias', 'Afastado', 'Bloqueado', 'Desligado', 'Inativo'];

const getStatusClass = (status) => {
    if (!status) return 'status-inativa';
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
};

export default function PaginaCondutores() {
  const [allCondutores, setAllCondutores] = useState([]);
  const [displayedCondutores, setDisplayedCondutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  // CORRIGIDO: Filtros alinhados com a nova interface
  const initialFilters = { nome_condutor: '', status: '', filial: '' };
  const [filters, setFilters] = useState(initialFilters);

  const fetchCondutores = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('condutores')
        .select('*')
        .order('nome_completo', { ascending: true });
      if (dbError) throw dbError;
      setAllCondutores(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message); setAllCondutores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCondutores(); }, [fetchCondutores]);

  useEffect(() => {
    let filteredData = [...allCondutores];
    if (filters.nome_condutor) { filteredData = filteredData.filter(c => c.nome_completo?.toLowerCase().includes(filters.nome_condutor.toLowerCase())); }
    if (filters.filial) { filteredData = filteredData.filter(c => c.empresa_filial_nome?.toLowerCase().includes(filters.filial.toLowerCase())); }
    if (filters.status) { filteredData = filteredData.filter(c => c.status_condutor === filters.status); }
    setDisplayedCondutores(filteredData);
  }, [allCondutores, filters]);

  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const handleClearFilters = () => { setFilters(initialFilters); };
  const handleDelete = (condutorId, condutorIdentifier) => { setFeedbackMessage({ type: '', text: '' }); setItemToDelete({ id: condutorId, identifier: condutorIdentifier }); setIsConfirmModalOpen(true); };
  const executeDelete = async () => {
      if (!itemToDelete?.id) return;
      setIsConfirmModalOpen(false);
      try {
          const response = await fetch(`/api/condutores/${itemToDelete.id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Falha ao excluir condutor.');
          setFeedbackMessage({ type: 'success', text: `Condutor "${itemToDelete.identifier}" excluído com sucesso.` });
          fetchCondutores();
      } catch (e) {
          setFeedbackMessage({ type: 'error', text: e.message });
      } finally {
          setItemToDelete(null);
          setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 5000);
      }
  };
  
  const formatCPF = (cpf) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="main-content-area">
      <div className="page-header">
        <h1 className="page-title">Gerenciamento de Condutores</h1>
        <Link href="/condutores/novo" className="btn btn-primary"><IconPlus /><span>Adicionar Novo Condutor</span></Link>
      </div>
      
      <div className="filters-section card">
        <h2 className="filters-title"><IconFilter /> Filtros</h2>
        <div className="form-grid cols-3">          
          <div className="form-item"><label htmlFor="nome_condutor">Nome do Condutor</label><input type="text" name="nome_condutor" id="nome_condutor" value={filters.nome_condutor} onChange={handleFilterChange} placeholder="Digite para filtrar..." /></div>
          <div className="form-item">
            <label htmlFor="status">Status</label>
            <select name="status" id="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Todos os Status</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="form-item"><label htmlFor="filial">Filial</label><input type="text" name="filial" id="filial" value={filters.filial} onChange={handleFilterChange} placeholder="Digite para filtrar..." /></div>
        </div>
        <div className="filters-actions">
          <button onClick={handleClearFilters} className="btn btn-secondary"><IconClearFilter /> Limpar Filtros</button>
        </div>
      </div>
      
      {feedbackMessage.text && <div className={`form-feedback-message ${feedbackMessage.type}`}>{feedbackMessage.text}</div>}

      <div className="table-container card">
        <table className="data-table"> 
          <thead>
            <tr>
              <th>Nome Completo</th><th>CPF / CNPJ</th><th>Nº CNH</th><th>Validade CNH</th><th>Status</th><th>Filial Associada</th><th style={{textAlign: 'right'}}>Ações</th> 
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Carregando condutores...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--magnum-red-status)' }}>{error}</td></tr>
            ) : displayedCondutores.length > 0 ? (
              displayedCondutores.map((condutor) => (
                <tr key={condutor.id}>
                  <td>{condutor.nome_completo || 'N/A'}</td>
                  <td>{formatCPF(condutor.cpf)}</td>
                  <td>{condutor.cnh_numero || 'N/A'}</td>
                  <td>{formatDate(condutor.validade_cnh)}</td>
                  <td><span className={`status-badge ${getStatusClass(condutor.status_condutor)}`}>{condutor.status_condutor}</span></td> 
                  <td>{condutor.empresa_filial_nome || 'N/A'}</td>
                  <td className="actions-cell">
                    <Link href={`/condutores/${condutor.id}`} title="Ver Detalhes" className="btn-icon info"><IconDetalhes /></Link>
                    <Link href={`/condutores/${condutor.id}/editar`} title="Editar Condutor" className="btn-icon warning"><IconEditar /></Link>
                    <button onClick={() => handleDelete(condutor.id, condutor.nome_completo)} title="Excluir Condutor" className="btn-icon"><IconExcluir /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Nenhum condutor encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeDelete}
        title="Confirmar Exclusão de Condutor"
        message={itemToDelete ? `Tem certeza que deseja excluir o condutor "${itemToDelete.identifier}"?` : ''}
        confirmButtonText="Sim, Excluir"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}
