'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';

// ÍCONES
const IconEditar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);
const IconExcluir = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);
const IconVoltar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
const IconChecklist = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.03 5.29L12.75 13.58l-3.29-3.29c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4 4c.39.39 1.02.39 1.41 0l9-9c.39-.39.39-1.02 0-1.41s-1.03-.39-1.42 0zM5 19h14v2H5zM5 15h14v2H5zM5 11h6v2H5zM5 7h6v2H5z"/>
  </svg>
);
const IconCarro = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);
const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);
const IconContrato = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
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

// COMPONENTE DE DISPLAY DE INFORMAÇÕES
function InfoDisplay({ label, value, format }) {
  if (value === null || value === undefined || value === '') return <div className="info-item"><label>{label}</label><span>N/A</span></div>;
  let displayValue = value;
  if (format === 'date') displayValue = new Date(value.includes('T') ? value : value + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  if (format === 'currency') displayValue = parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (typeof value === 'boolean') displayValue = value ? 'Sim' : 'Não';
  return (
    <div className="info-item">
      <label>{label}</label>
      <span>{displayValue}</span>
    </div>
  );
}

// COMPONENTE PRINCIPAL
export default function PaginaDetalhesVeiculo() {
  const [veiculo, setVeiculo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const veiculoId = params?.id;

  const fetchVeiculoDetails = useCallback(async () => { 
    if (!veiculoId) { setIsLoading(false); return; } 
    setIsLoading(true); 
    try { 
      const response = await fetch(`/api/veiculos/${veiculoId}`); 
      const data = await response.json(); 
      if (!response.ok) throw new Error(data.message || `Erro ao buscar detalhes`); 
      setVeiculo(data); 
    } catch (e) { 
      setError(e.message); setVeiculo(null); 
    } finally { setIsLoading(false); } 
  }, [veiculoId]);
  
  useEffect(() => { if (veiculoId) { fetchVeiculoDetails(); } }, [veiculoId, fetchVeiculoDetails]);
  const handleOpenDeleteModal = () => { setIsConfirmModalOpen(true); };
  const executeDelete = async () => { 
    if (!veiculo?.id) return; setIsConfirmModalOpen(false); 
    try { 
      const response = await fetch(`/api/veiculos/${veiculo.id}`, { method: 'DELETE' }); 
      const result = await response.json(); 
      if (!response.ok) throw new Error(result.message); 
      alert('Veículo excluído com sucesso!'); 
      router.push('/veiculos'); 
    } catch (e) { setFeedbackMessage({ type: 'error', text: e.message }); } 
  };

  if (isLoading) { return <div className="main-content-area"><div className="card">Carregando detalhes do veículo...</div></div>; }
  if (error) { return <div className="main-content-area"><div className="card form-feedback-message error">Erro ao carregar detalhes: {error}</div></div>; }
  if (!veiculo) { return <div className="main-content-area"><div className="card">Veículo não encontrado.</div></div>; }

  const placaOuPrefixo = veiculo.placa || `ID ${veiculo.id}`;

  return (
    <div className="main-content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">{placaOuPrefixo}</h1>
          <p style={{ color: 'var(--magnum-text-light)', marginTop: 'var(--space-2)' }}>
            Detalhes Completos do Veículo
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/veiculos" className="btn btn-dark"> <IconVoltar /> Voltar </Link>
          <Link href={`/veiculos/${veiculo.id}/checklist/emitir`} className="btn btn-outline-dark"> <IconChecklist /> Emitir Check-list </Link>
          <button onClick={handleOpenDeleteModal} className="btn btn-outline-danger"> <IconExcluir /> Excluir </button>
          <Link href={`/veiculos/${veiculo.id}/editar`} className="btn btn-primary"> <IconEditar /> Editar </Link>
        </div>
      </div>

      {feedbackMessage.text && <div className={`form-feedback-message ${feedbackMessage.type}`}>{feedbackMessage.text}</div>}
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconCarro /> Identificação</h2>
            <div className="form-grid cols-2 md:cols-3">
              <InfoDisplay label="Placa" value={veiculo.placa} format={null} />
              <InfoDisplay label="Renavam" value={veiculo.renavam} format={null} />
              <InfoDisplay label="Chassi" value={veiculo.chassi} format={null} />
              <InfoDisplay label="Marca" value={veiculo.marca} format={null} />
              <InfoDisplay label="Modelo" value={veiculo.modelo} format={null} />
              <InfoDisplay label="Cor" value={veiculo.cor} format={null} />
              <InfoDisplay label="Ano Fabricação" value={veiculo.ano_fabricacao} format={null} />
              <InfoDisplay label="Ano Modelo" value={veiculo.ano_modelo} format={null} />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title"><IconInfo /> Uso e Localização</h2>
            <div className="form-grid cols-2 md:cols-3">
              <InfoDisplay label="Empresa" value={veiculo.empresa_responsavel} format={null} />
              <InfoDisplay label="Gestor" value={veiculo.gestor_responsavel} format={null} />
              <InfoDisplay label="Apoio da Gestão" value={veiculo.apoio_gestao} format={null} />
              <InfoDisplay label="Centro de Custo" value={veiculo.centro_custo_veiculo} format={null} />
              <InfoDisplay label="Finalidade" value={veiculo.finalidade} format={null} />
              <InfoDisplay label="Cidade" value={veiculo.cidade} format={null} />
              <InfoDisplay label="UF" value={veiculo.estado_uf} format={null} />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title"><IconContrato /> Contrato</h2>
            <div className="form-grid cols-2 md:cols-3">
              <InfoDisplay label="Locadora" value={veiculo.locadora} format={null} />
              <InfoDisplay label="Valor Mensal" value={veiculo.valor_mensal} format="currency" />
              <InfoDisplay label="Período (Meses)" value={veiculo.periodo_contrato_meses} format={null} />
              <InfoDisplay label="Disponibilização" value={veiculo.data_disponibilizacao} format="date" />
              <InfoDisplay label="Devolução Prevista" value={veiculo.data_prevista_devolucao} format="date" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <h2 className="section-title"><IconInfo /> Status</h2>
            <div className="info-item">
              <label>Ativo no Sistema</label>
              <span>{veiculo.ativo ? 'Sim' : 'Não'}</span>
            </div>
          </div>
          <div className="card">
            <h2 className="section-title"><IconAnexo /> Anexos</h2>
            {veiculo.anexos && veiculo.anexos.length > 0 ? (
              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {veiculo.anexos.map((anexo, index) => (
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
                Nenhum anexo para este veículo.
              </p>
            )}
          </div>
          <div className="card">
            <h2 className="section-title"><IconObservacao /> Observações</h2>
            <p style={{whiteSpace: 'pre-wrap', color: 'var(--magnum-text-light)', fontSize: '0.9rem'}}>
              {veiculo.observacao_geral || 'Nenhuma observação registrada.'}
            </p>
          </div>
        </div>
      </div>

      {veiculo && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={executeDelete}
          title="Confirmar Exclusão de Veículo"
          message={`Tem certeza que deseja excluir o veículo placa ${placaOuPrefixo}?`}
          confirmButtonText="Sim, Excluir"
          cancelButtonText="Cancelar"
        />
      )}
    </div>
  );
}
