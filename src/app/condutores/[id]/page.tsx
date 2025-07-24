// src/app/condutores/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';
import { supabase } from '@/lib/supabaseClient';

// Ícones
const IconEditar = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconExcluir = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconVoltar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const IconTermo = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>;
const IconDocumento = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M20,6H4V4H20V6M20,12H4V10H20V12M20,18H4V16H20V18M3,20H21V2H3V20M5,4H19V18H5V4Z" /></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
const IconObservacao = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;

function InfoDisplay({ label, value }) {
    if (value === null || value === undefined || value === '') {
        return ( <div className="info-item"><label>{label}</label><span>N/A</span></div> );
    }
    return ( <div className="info-item"> <label>{label}</label> <span>{String(value)}</span> </div> );
}

export default function PaginaDetalhesCondutor() {
  const [condutor, setCondutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const condutorId = params?.id;
  
  const fetchCondutorDetails = useCallback(async () => {
    if (!condutorId) {
      setError("ID do condutor não especificado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('condutores')
        .select('*')
        .eq('id', condutorId)
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error("Condutor não encontrado.");
      
      setCondutor(data);
    } catch (e) {
      console.error("Frontend (Detalhes): Falha ao buscar dados do condutor:", e);
      setError(e.message);
      setCondutor(null);
    } finally {
      setIsLoading(false);
    }
  }, [condutorId]);

  useEffect(() => { fetchCondutorDetails(); }, [fetchCondutorDetails]);
  
  const handleOpenDeleteModal = () => { setFeedbackMessage({ type: '', text: '' }); setIsConfirmModalOpen(true); };
  const executeDelete = async () => { if (!condutor || !condutor.id) return; setIsConfirmModalOpen(false); try { const response = await fetch(`/api/condutores/${condutor.id}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) { throw new Error(result.message || `Erro ao excluir. Status: ${response.status}`); } alert(result.message || 'Condutor excluído!'); router.push('/condutores'); } catch (e) { setFeedbackMessage({ type: 'error', text: e.message || 'Falha ao excluir.' }); } };
  
  const formatDate = (dateString) => { if (!dateString) return null; const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); if (isNaN(date.getTime())) return 'Data inválida'; return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); };
  
  const formatDocument = (doc) => {
    if (!doc || typeof doc !== 'string') return '';
    const digits = doc.replace(/\D/g, '');
    if (digits.length === 11) { // CPF
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) { // CNPJ
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  const formatTelefone = (telefone) => { if (!telefone || typeof telefone !== 'string') return ''; const digits = telefone.replace(/\D/g, ''); if (digits.length === 11) { return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); } if (digits.length === 10) { return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); } return telefone; };
  
  if (isLoading) { return <div className="main-content-area"><div className="card">Carregando detalhes do condutor...</div></div>; }
  if (error) { return <div className="main-content-area"><div className="card form-feedback-message error"><h2>Erro ao Carregar</h2><p>{error}</p></div></div>; }
  if (!condutor) { return <div className="main-content-area"><div className="card">Condutor não encontrado.</div></div>; }

  return (
    <div className="main-content-area">
      <div className="page-header">
        <div>
            <h1 className="page-title">{condutor.nome_completo}</h1>
            <p style={{ color: 'var(--magnum-text-light)', marginTop: 'var(--space-2)' }}>Detalhes Completos do Condutor</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/condutores" className="btn btn-dark"><IconVoltar /> Voltar</Link>
          <Link href={`/condutores/${condutor.id}/emitir-termo`} className="btn btn-outline-dark"><IconTermo /> Emitir Termo</Link>
          <button onClick={handleOpenDeleteModal} className="btn btn-outline-danger"><IconExcluir /> Excluir</button>
          <Link href={`/condutores/${condutor.id}/editar`} className="btn btn-primary"><IconEditar /> Editar</Link>
        </div>
      </div>
      
      {feedbackMessage.text && <div className={`form-feedback-message ${feedbackMessage.type}`}>{feedbackMessage.text}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconUser /> Dados Pessoais</h2>
            <div className="form-grid cols-2">
              <InfoDisplay label="Nome Completo" value={condutor.nome_completo} />
              <InfoDisplay label="CPF" value={formatDocument(condutor.cpf)} />
              <InfoDisplay label="RG" value={condutor.rg} />
              <InfoDisplay label="Data de Nascimento" value={formatDate(condutor.data_nascimento)} />
              <InfoDisplay label="Telefone" value={formatTelefone(condutor.telefone)} />
              <InfoDisplay label="E-mail" value={condutor.email} />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title"><IconDocumento /> Documento de Habilitação</h2>
            <div className="form-grid cols-3">
              <InfoDisplay label="Nº da CNH" value={condutor.cnh_numero} />
              <InfoDisplay label="Categoria" value={condutor.categoria_cnh} />
              <InfoDisplay label="Validade da CNH" value={formatDate(condutor.validade_cnh)} />
            </div>
          </div>
          
          <div className="card">
            <h2 className="section-title"><IconInfo /> Informações Corporativas</h2>
            <div className="form-grid cols-2">
              <InfoDisplay label="Empresa" value={condutor.empresa_filial_nome} />
              <InfoDisplay label="Cargo" value={condutor.cargo} />
              <InfoDisplay label="Departamento" value={condutor.departamento} />
              <InfoDisplay label="Gestor Responsável" value={condutor.gestor_responsavel} />
              <InfoDisplay label="Centro de Custo" value={condutor.centro_custo_condutor} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconInfo /> Status</h2>
            <div className="info-item">
              <label>Status do Condutor</label>
              <span className={`status-badge status-${condutor.status_condutor?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {condutor.status_condutor || 'N/A'}
              </span>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title"><IconAnexo /> Anexos</h2>
            {condutor.anexos && condutor.anexos.length > 0 ? (
              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {condutor.anexos.map((anexo, index) => (
                  <li key={index}>
                    <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                      {anexo.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--magnum-text-light)', fontStyle: 'italic' }}>
                Nenhum anexo para este condutor.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="section-title"><IconObservacao /> Observações</h2>
            <p style={{whiteSpace: 'pre-wrap', color: 'var(--magnum-text-light)', fontSize: '0.9rem'}}>
              {condutor.observacoes || 'Nenhuma observação registrada.'}
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={executeDelete}
          title="Confirmar Exclusão de Condutor"
          message={`Tem certeza que deseja excluir o condutor "${condutor.nome_completo}"?`}
          confirmButtonText="Sim, excluir"
          cancelButtonText="Cancelar"
      />
    </div>
  );
}
