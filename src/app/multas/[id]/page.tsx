// ==================================================================
// ARQUIVO: src/app/multas/[id]/page.js (Página de Detalhes da Multa)
// ==================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';
import { supabase } from '@/lib/supabaseClient';

// Ícones
const IconEditar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconExcluir = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconVoltar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const IconMulta = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>;
const IconPagamento = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>;
const IconObservacao = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;

function InfoDisplay({ label, value, format }) {
    if (value === null || value === undefined || value === '') {
        return ( <div className="info-item"><label>{label}</label><span>N/A</span></div> );
    }
    let displayValue = value;
    if (format === 'date') displayValue = new Date(value.includes('T') ? value : value + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    if (format === 'currency') displayValue = parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    return ( <div className="info-item"> <label>{label}</label> <span>{String(displayValue)}</span> </div> );
}

export default function PaginaDetalhesMulta() {
    const [multa, setMulta] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const multaId = params?.id;

    const fetchMultaDetails = useCallback(async () => {
        if (!multaId) { 
            setError("ID da multa não fornecido."); 
            setIsLoading(false); 
            return; 
        }
        setIsLoading(true); setError(null);
        try {
            const response = await fetch(`/api/multas/${multaId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro ao buscar detalhes: ${response.status}`);
            setMulta(data);
        } catch (e) {
            console.error("Frontend (Detalhes): Falha ao buscar dados da multa:", e);
            setError(e.message);
            setMulta(null);
        } finally {
            setIsLoading(false);
        }
    }, [multaId]);

    useEffect(() => {
        // Evita que a página de detalhes tente renderizar a rota /novo
        if (multaId === 'novo') {
            setIsLoading(false);
            return;
        }
        fetchMultaDetails();
    }, [multaId, fetchMultaDetails]);

    const handleOpenDeleteModal = () => setIsConfirmModalOpen(true);
    const executeDelete = async () => {
        if (!multa || !multa.id) return;
        setIsConfirmModalOpen(false);
        try {
            const response = await fetch(`/api/multas/${multa.id}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Erro ao excluir. Status: ${response.status}`);
            alert(result.message || 'Multa excluída com sucesso!');
            router.push('/multas');
        } catch (e) {
            alert(e.message || 'Falha ao excluir.');
        }
    };

    if (isLoading) return <div className="main-content-area"><div className="card">Carregando detalhes da multa...</div></div>;
    if (error) return <div className="main-content-area"><div className="card form-feedback-message error"><h2>Erro ao Carregar</h2><p>{error}</p></div></div>;
    if (!multa) return null; // Não renderiza nada se a multa não for encontrada ou a rota for /novo

    return (
        <div className="main-content-area">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Multa AIT: {multa.ait_numero}</h1>
                    <p style={{ color: 'var(--magnum-text-light)', marginTop: 'var(--space-2)' }}>Detalhes Completos da Infração</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <Link href="/multas" className="btn btn-dark"><IconVoltar /> Voltar</Link>
                    <button onClick={handleOpenDeleteModal} className="btn btn-outline-danger"><IconExcluir /> Excluir</button>
                    <Link href={`/multas/${multa.id}/editar`} className="btn btn-primary"><IconEditar /> Editar</Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="card">
                        <h2 className="section-title"><IconMulta /> Dados da Infração</h2>
                        <div className="form-grid cols-3">
                            <InfoDisplay label="Nº do AIT" value={multa.ait_numero} />
                            <InfoDisplay label="Placa do Veículo" value={multa.veiculos?.placa} />
                            <InfoDisplay label="Data da Infração" value={multa.data_infracao} format="date" />
                            <InfoDisplay label="Gravidade" value={multa.gravidade_infracao} />
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="section-title"><IconUser /> Indicação do Condutor</h2>
                        <div className="form-grid cols-3">
                            <InfoDisplay label="Condutor Indicado" value={multa.condutores?.nome_completo} />
                            <InfoDisplay label="Data da Notificação" value={multa.data_notificacao_indicacao} format="date" />
                            <InfoDisplay label="Prazo para Indicação" value={multa.prazo_indicacao_condutor} format="date" />
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="section-title"><IconPagamento /> Fatura e Pagamento</h2>
                        <div className="form-grid cols-3">
                            <InfoDisplay label="Nº da Fatura" value={multa.numero_fatura} />
                            <InfoDisplay label="Valor Original" value={multa.valor_original_multa} format="currency" />
                            <InfoDisplay label="Data de Vencimento" value={multa.data_vencimento_multa} format="date" />
                            <InfoDisplay label="Data de Pagamento" value={multa.data_pagamento_multa} format="date" />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="card">
                        <h2 className="section-title"><IconInfo /> Status</h2>
                        <div className="info-item">
                            <label>Status da Indicação</label>
                            <span className={`status-badge status-${multa.status_indicacao?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {multa.status_indicacao || 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <label>Status do Pagamento</label>
                            <span className={`status-badge status-${multa.status_pagamento_multa?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {multa.status_pagamento_multa || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="section-title"><IconAnexo /> Anexos</h2>
                        {multa.anexos && multa.anexos.length > 0 ? (
                        <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {multa.anexos.map((anexo, index) => (
                            <li key={index}>
                                <a 
                                href={anexo.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                >
                                {anexo.fileName}
                                </a>
                            </li>
                            ))}
                        </ul>
                        ) : (
                        <p style={{ color: 'var(--magnum-text-light)', fontStyle: 'italic' }}>
                            Nenhum anexo para esta multa.
                        </p>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="section-title"><IconObservacao /> Observações</h2>
                        <p style={{whiteSpace: 'pre-wrap', color: 'var(--magnum-text-light)', fontSize: '0.9rem'}}>
                            {multa.observacoes_gerais_multa || 'Nenhuma observação registrada.'}
                        </p>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeDelete}
                title="Confirmar Exclusão de Multa"
                message={`Tem certeza que deseja excluir a multa AIT ${multa.ait_numero}?`}
                confirmButtonText="Sim, excluir"
                cancelButtonText="Cancelar"
            />
        </div>
    );
}
