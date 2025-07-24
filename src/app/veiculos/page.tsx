// src/app/veiculos/page.js
"use client";

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
const IconChecklist = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.03 5.29L12.75 13.58l-3.29-3.29c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4 4c.39.39 1.02.39 1.41 0l9-9c.39-.39.39-1.02 0-1.41s-1.03-.39-1.42 0zM5 19h14v2H5zM5 15h14v2H5zM5 11h6v2H5zM5 7h6v2H5z"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

export default function PaginaVeiculos() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [displayedVehicles, setDisplayedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  // REMOVIDO: 'status_veiculo' removido dos filtros
  const initialFilters = { empresa_responsavel: '', placa: '', gestor_responsavel: '', estado_uf: '', ativo: '' };
  const [filters, setFilters] = useState(initialFilters);

  const fetchVehicles = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message); setAllVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  useEffect(() => {
    let filteredData = [...allVehicles];
    if (filters.empresa_responsavel) { filteredData = filteredData.filter(v => v.empresa_responsavel?.toLowerCase().includes(filters.empresa_responsavel.toLowerCase())); }
    if (filters.placa) { filteredData = filteredData.filter(v => v.placa?.toLowerCase().includes(filters.placa.toLowerCase())); }
    if (filters.gestor_responsavel) { filteredData = filteredData.filter(v => v.gestor_responsavel?.toLowerCase().includes(filters.gestor_responsavel.toLowerCase())); }
    if (filters.estado_uf) { filteredData = filteredData.filter(v => v.estado_uf?.toLowerCase() === filters.estado_uf.toLowerCase()); }
    if (filters.ativo && filters.ativo !== '') { const isActive = filters.ativo === 'sim'; filteredData = filteredData.filter(v => v.ativo === isActive); }
    setDisplayedVehicles(filteredData);
  }, [allVehicles, filters]);

  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const handleClearFilters = () => { setFilters(initialFilters); };
  const handleDeleteVehicle = (vehicleId, vehicleIdentifier) => { setFeedbackMessage({ type: '', text: '' }); setItemToDelete({ id: vehicleId, identifier: vehicleIdentifier }); setIsConfirmModalOpen(true); };
  const executeDelete = async () => {
      if (!itemToDelete?.id) return;
      setIsConfirmModalOpen(false);
      try {
          const response = await fetch(`/api/veiculos/${itemToDelete.id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Falha ao excluir veículo.');
          setFeedbackMessage({ type: 'success', text: `Veículo "${itemToDelete.identifier}" excluído com sucesso.` });
          fetchVehicles();
      } catch (e) {
          setFeedbackMessage({ type: 'error', text: e.message });
      } finally {
          setItemToDelete(null);
          setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 5000);
      }
  };

  return (
    <div className="main-content-area">
      <div className="page-header">
        <h1 className="page-title">Frota de Veículos</h1>
        <Link href="/veiculos/novo" className="btn btn-primary"><IconPlus /><span>Novo Veículo</span></Link>
      </div>
      
      <div className="filters-section card">
        <h2 className="filters-title"><IconFilter /> Filtro</h2>
        {/* CORRIGIDO: Grid ajustado para os filtros restantes */}
        <div className="form-grid cols-3">          
          <div className="form-item"><label htmlFor="empresa_responsavel">Empresa</label><input type="text" name="empresa_responsavel" id="empresa_responsavel" value={filters.empresa_responsavel} onChange={handleFilterChange} placeholder="Nome da empresa" /></div>
          <div className="form-item"><label htmlFor="placa">Placa</label><input type="text" name="placa" id="placa" value={filters.placa} onChange={handleFilterChange} placeholder="AAA-0A00" /></div>
          <div className="form-item"><label htmlFor="gestor_responsavel">Gestor</label><input type="text" name="gestor_responsavel" id="gestor_responsavel" value={filters.gestor_responsavel} onChange={handleFilterChange} placeholder="Nome do gestor" /></div>
          <div className="form-item"><label htmlFor="estado_uf">UF</label><input type="text" name="estado_uf" id="estado_uf" value={filters.estado_uf} onChange={handleFilterChange} placeholder="Ex: PE" maxLength={2} /></div>
           <div className="form-item">
            <label htmlFor="ativo">Ativo?</label>
            <select name="ativo" id="ativo" value={filters.ativo} onChange={handleFilterChange}>
              <option value="">Todos</option> 
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
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
              {/* REMOVIDO: Coluna de Status */}
              <th>Placa</th><th>Renavam</th><th>Empresa</th><th>Modelo</th><th>Gestor</th><th>Apoio da Gestão</th><th style={{textAlign: 'right'}}>Ações</th> 
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Carregando veículos...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--magnum-red-status)' }}>{error}</td></tr>
            ) : displayedVehicles.length > 0 ? (
              displayedVehicles.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.placa || 'N/A'}</td>
                  <td>{veiculo.renavam || 'N/A'}</td>
                  <td>{veiculo.empresa_responsavel || 'N/A'}</td>
                  <td>{veiculo.modelo || 'N/A'}</td>
                  {/* REMOVIDO: Célula de Status */}
                  <td>{veiculo.gestor_responsavel || 'N/A'}</td>
                  <td>{veiculo.apoio_gestao || 'N/A'}</td>
                  <td className="actions-cell">
                    <Link href={`/veiculos/${veiculo.id}`} title="Ver Detalhes" className="btn-icon info"><IconDetalhes /></Link>
                    <Link href={`/veiculos/${veiculo.id}/editar`} title="Editar Veículo" className="btn-icon warning"><IconEditar /></Link>
                    <Link href={`/veiculos/${veiculo.id}/checklist/emitir`} title="Emitir Check-list" className="btn-icon success"><IconChecklist /></Link>
                    <button onClick={() => handleDeleteVehicle(veiculo.id, veiculo.placa || `ID ${veiculo.id}`)} title="Excluir Veículo" className="btn-icon"><IconExcluir /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Nenhum veículo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setItemToDelete(null); }}
        onConfirm={executeDelete}
        title="Confirmar Exclusão de Veículo"
        message={itemToDelete ? `Tem certeza que deseja excluir o veículo ${itemToDelete.identifier}? Esta ação não pode ser desfeita.` : ''}
        confirmButtonText="Sim, Excluir"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}
