// src/app/empresas/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';

// --- Icones ---
const IconVoltar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
const IconExcluir = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);
const IconEditar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);
const IconEmpresa = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
  </svg>
);
const IconEndereco = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);
const IconAnexo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/>
  </svg>
);
const IconObservacao = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

// --- Helper para exibir label + value ---
interface InfoDisplayProps {
  label: string;
  value: string | undefined | null;
}
const InfoDisplay: FC<InfoDisplayProps> = ({ label, value }) => (
  <div className="info-item">
    <label>{label}</label>
    <span>{value ?? 'N/A'}</span>
  </div>
);

// --- Tipagem dos dados que vêm da API ---
interface Anexo {
  url: string;
  fileName: string;
  filePath: string;
}

interface EmpresaDetail {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  anexos?: Anexo[];
  observacoes?: string;
}

export default function PaginaDetalhesEmpresa() {
  const router = useRouter();
  const params = useParams() as { id?: string | string[] };
  const raw = params.id;
  const empresaId = Array.isArray(raw) ? raw[0] : raw;

  const [empresa, setEmpresa] = useState<EmpresaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchEmpresaDetails = useCallback(async () => {
    if (!empresaId) {
      setError('ID da empresa inválido.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/empresas/${empresaId}`);
      // JSON.parse errors also caught below
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
      setEmpresa(json as EmpresaDetail);
    } catch (e: any) {
      console.error('Falha ao buscar os detalhes da empresa.', e);
      setError(e.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, [empresaId]);

  useEffect(() => { fetchEmpresaDetails(); }, [fetchEmpresaDetails]);

  const handleOpenDeleteModal = () => setIsConfirmModalOpen(true);
  const executeDelete = async () => {
    if (!empresa) return;
    setIsConfirmModalOpen(false);
    try {
      const res = await fetch(`/api/empresas/${empresa.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Erro ${res.status}`);
      router.push('/empresas');
    } catch (e: any) {
      alert(e.message || 'Falha ao excluir.');
    }
  };

  const formatCNPJ = (cnpj?: string) => {
    if (!cnpj) return '';
    const d = cnpj.replace(/\D/g, '');
    if (d.length !== 14) return cnpj;
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  if (isLoading) {
    return (
      <div className="main-content-area">
        <div className="card">Carregando detalhes da empresa...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="main-content-area">
        <div className="card form-feedback-message error">
          <h2>Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (!empresa) {
    return (
      <div className="main-content-area">
        <div className="card">Empresa não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">{empresa.razao_social}</h1>
          <p style={{ color: 'var(--magnum-text-light)', marginTop: 'var(--space-2)' }}>
            Detalhes Completos da Empresa
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/empresas" className="btn btn-dark"><IconVoltar /> Voltar</Link>
          <button onClick={handleOpenDeleteModal} className="btn btn-outline-danger"><IconExcluir /> Excluir</button>
          <Link href={`/empresas/${empresa.id}/editar`} className="btn btn-primary"><IconEditar /> Editar</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconEmpresa /> Dados da Empresa</h2>
            <div className="form-grid cols-3">
              <InfoDisplay label="Razão Social" value={empresa.razao_social} />
              <InfoDisplay label="Nome Fantasia" value={empresa.nome_fantasia} />
              <InfoDisplay label="CNPJ" value={formatCNPJ(empresa.cnpj)} />
              <InfoDisplay label="Inscrição Estadual" value={empresa.inscricao_estadual} />
              <InfoDisplay label="Inscrição Municipal" value={empresa.inscricao_municipal} />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title"><IconEndereco /> Endereço</h2>
            <div className="form-grid cols-4">
              <InfoDisplay label="CEP" value={empresa.cep} />
              <InfoDisplay label="Logradouro" value={empresa.logradouro} />
              <InfoDisplay label="Número" value={empresa.numero} />
              <InfoDisplay label="Complemento" value={empresa.complemento} />
              <InfoDisplay label="Bairro" value={empresa.bairro} />
              <InfoDisplay label="Cidade" value={empresa.cidade} />
              <InfoDisplay label="UF" value={empresa.uf} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconAnexo /> Anexos</h2>
            {empresa.anexos && empresa.anexos.length > 0 ? (
              <ul style={{ listStyle: 'none', paddingLeft: 0, gap: 'var(--space-3)', display: 'flex', flexDirection: 'column' }}>
                {empresa.anexos.map((a, i) => (
                  <li key={i}>
                    <Link href={a.url} className="btn btn-secondary btn-sm" target="_blank">
                      {a.fileName}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--magnum-text-light)', fontStyle: 'italic' }}>Nenhum anexo.</p>
            )}
          </div>

          <div className="card">
            <h2 className="section-title"><IconObservacao /> Observações</h2>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--magnum-text-light)' }}>
              {empresa.observacoes || 'Nenhuma observação registrada.'}
            </p>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeDelete}
        title="Confirmar Exclusão"
        message={`Excluir a empresa "${empresa.razao_social}"?`}
        confirmButtonText="Sim, excluir"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}
