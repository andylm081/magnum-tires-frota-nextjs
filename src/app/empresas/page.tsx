// src/app/empresas/page.js
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

export default function PaginaEmpresas() {
    const [allEmpresas, setAllEmpresas] = useState([]);
    const [displayedEmpresas, setDisplayedEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); 
    // REMOVIDO: 'status' removido dos filtros iniciais
    const initialFilters = { razao_social: '', cnpj: '' };
    const [filters, setFilters] = useState(initialFilters);

    const fetchEmpresas = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('empresas')
                .select('*')
                .order('razao_social', { ascending: true });
            if (dbError) throw dbError;
            setAllEmpresas(data || []);
        } catch (e) {
            setError(e.message); setAllEmpresas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

    useEffect(() => {
        let filteredData = [...allEmpresas];
        if (filters.razao_social) { filteredData = filteredData.filter(e => e.razao_social?.toLowerCase().includes(filters.razao_social.toLowerCase())); }
        if (filters.cnpj) { filteredData = filteredData.filter(e => e.cnpj?.replace(/\D/g, '').includes(filters.cnpj.replace(/\D/g, ''))); }
        // REMOVIDO: Lógica de filtro por status
        setDisplayedEmpresas(filteredData);
    }, [allEmpresas, filters]);

    const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
    const handleClearFilters = () => { setFilters(initialFilters); };
    const handleDelete = (empresaId, empresaIdentifier) => { setFeedbackMessage({ type: '', text: '' }); setItemToDelete({ id: empresaId, identifier: empresaIdentifier }); setIsConfirmModalOpen(true); };
    const executeDelete = async () => {
        if (!itemToDelete?.id) return;
        setIsConfirmModalOpen(false);
        try {
            const response = await fetch(`/api/empresas/${itemToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir empresa.');
            setFeedbackMessage({ type: 'success', text: `Empresa "${itemToDelete.identifier}" excluída com sucesso.` });
            fetchEmpresas();
        } catch (e) {
            setFeedbackMessage({ type: 'error', text: e.message });
        } finally {
            setItemToDelete(null);
            setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 5000);
        }
    };

    const formatCNPJ = (cnpj) => {
        if (!cnpj) return 'N/A';
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    return (
        <div className="main-content-area">
            <div className="page-header">
                <h1 className="page-title">Empresas</h1>
                <Link href="/empresas/novo" className="btn btn-primary"><IconPlus /><span>Nova Empresa</span></Link>
            </div>
            
            <div className="filters-section card">
                <h2 className="filters-title"><IconFilter /> Filtros</h2>
                {/* CORRIGIDO: Grid agora com 2 colunas */}
                <div className="form-grid cols-2">
                    <div className="form-item"><label htmlFor="razao_social">Razão Social</label><input type="text" name="razao_social" id="razao_social" value={filters.razao_social} onChange={handleFilterChange} placeholder="Nome da empresa" /></div>
                    <div className="form-item"><label htmlFor="cnpj">CNPJ</label><input type="text" name="cnpj" id="cnpj" value={filters.cnpj} onChange={handleFilterChange} placeholder="00.000.000/0000-00" /></div>
                    {/* REMOVIDO: Filtro de status */}
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
                            <th>Razão Social</th><th>Nome Fantasia</th><th>CNPJ</th><th style={{textAlign: 'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Carregando empresas...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--magnum-red-status)' }}>{error}</td></tr>
                        ) : displayedEmpresas.length > 0 ? (
                            displayedEmpresas.map((empresa) => (
                                <tr key={empresa.id}>
                                    <td>{empresa.razao_social}</td>
                                    <td>{empresa.nome_fantasia || 'N/A'}</td>
                                    <td>{formatCNPJ(empresa.cnpj)}</td>
                                    {/* REMOVIDO: Célula de Status */}
                                    <td className="actions-cell">
                                        <Link href={`/empresas/${empresa.id}`} title="Ver Detalhes" className="btn-icon info"><IconDetalhes /></Link>
                                        <Link href={`/empresas/${empresa.id}/editar`} title="Editar Empresa" className="btn-icon warning"><IconEditar /></Link>
                                        <button onClick={() => handleDelete(empresa.id, empresa.razao_social)} title="Excluir Empresa" className="btn-icon"><IconExcluir /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Nenhuma empresa encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeDelete}
                title="Confirmar Exclusão de Empresa"
                message={itemToDelete ? `Tem certeza que deseja excluir a empresa "${itemToDelete.identifier}"?` : ''}
                confirmButtonText="Sim, Excluir"
                cancelButtonText="Cancelar"
            />
        </div>
    );
}
