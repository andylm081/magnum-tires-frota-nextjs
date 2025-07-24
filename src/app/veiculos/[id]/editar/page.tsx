'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import ConfirmationModal from '@/components/ConfirmationModal';

// Tipagem para os anexos
type Anexo = { url: string; fileName: string; filePath: string };

// Tipagem para o formulário de veículo
type VeiculoFormData = {
  placa: string;
  renavam: string;
  chassi: string;
  marca: string;
  modelo: string;
  ano_fabricacao: string;
  ano_modelo: string;
  cor: string;
  estado_uf: string;
  cidade: string;
  status_veiculo: string;
  empresa_responsavel: string;
  gestor_responsavel: string;
  apoio_gestao: string;
  centro_custo_veiculo: string;
  finalidade: string;
  locadora: string;
  valor_mensal: string;
  periodo_contrato_meses: string;
  data_disponibilizacao: string;
  data_prevista_devolucao: string;
  observacao_geral: string;
  anexos: Anexo[];
};

// Ícones usados no formulário
const IconSalvar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);
const IconAnexo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/>
  </svg>
);
const IconRemoverAnexo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// Formata string de data para input[type="date"]
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

// Opções de dropdown
const statusOptions = ['Disponível', 'Em uso', 'Em manutenção', 'Devolvido'];
const finalidadeOptions = ['COMERCIAL', 'CTC', 'USO DA UNIDADE (FILIAL)'];

// Estado inicial do formulário
const initialFormState: VeiculoFormData = {
  placa: '',
  renavam: '',
  chassi: '',
  marca: '',
  modelo: '',
  ano_fabricacao: '',
  ano_modelo: '',
  cor: '',
  estado_uf: '',
  cidade: '',
  status_veiculo: 'Disponível',
  empresa_responsavel: '',
  gestor_responsavel: '',
  apoio_gestao: '',
  centro_custo_veiculo: '',
  finalidade: '',
  locadora: '',
  valor_mensal: '',
  periodo_contrato_meses: '',
  data_disponibilizacao: '',
  data_prevista_devolucao: '',
  observacao_geral: '',
  anexos: [],
};

export default function PaginaEditarVeiculo() {
  const router = useRouter();
  const params = useParams();
  const veiculoId = params?.id as string;

  const [formData, setFormData] = useState<VeiculoFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnexoConfirmModalOpen, setIsAnexoConfirmModalOpen] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<Anexo | null>(null);

  const {
    displayValue: valorMensalDisplay,
    numericValue: valorMensalNumeric,
    handleChange: handleValorMensalChange,
    setValue: setCurrencyValue,
  } = useCurrencyInput();

  // Busca os dados do veículo e preenche o formulário
  const fetchVeiculoData = useCallback(async () => {
    if (!veiculoId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/veiculos/${veiculoId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao buscar dados do veículo.');
      // Mapeia cada campo
      const mapped: VeiculoFormData = {
        placa: data.placa ?? '',
        renavam: data.renavam ?? '',
        chassi: data.chassi ?? '',
        marca: data.marca ?? '',
        modelo: data.modelo ?? '',
        ano_fabricacao: data.ano_fabricacao != null ? String(data.ano_fabricacao) : '',
        ano_modelo: data.ano_modelo != null ? String(data.ano_modelo) : '',
        cor: data.cor ?? '',
        estado_uf: data.estado_uf ?? '',
        cidade: data.cidade ?? '',
        status_veiculo: data.status_veiculo ?? 'Disponível',
        empresa_responsavel: data.empresa_responsavel ?? '',
        gestor_responsavel: data.gestor_responsavel ?? '',
        apoio_gestao: data.apoio_gestao ?? '',
        centro_custo_veiculo: data.centro_custo_veiculo ?? '',
        finalidade: data.finalidade ?? '',
        locadora: data.locadora ?? '',
        valor_mensal: data.valor_mensal != null ? String(data.valor_mensal) : '',
        periodo_contrato_meses: data.periodo_contrato_meses != null ? String(data.periodo_contrato_meses) : '',
        data_disponibilizacao: formatDateForInput(data.data_disponibilizacao),
        data_prevista_devolucao: formatDateForInput(data.data_prevista_devolucao),
        observacao_geral: data.observacao_geral ?? '',
        anexos: Array.isArray(data.anexos)
          ? data.anexos.map((a: any) => ({
              url: a.url ?? '',
              fileName: a.fileName ?? '',
              filePath: a.filePath ?? '',
            }))
          : [],
      };
      setFormData(mapped);
      setCurrencyValue(mapped.valor_mensal);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [veiculoId, setCurrencyValue]);

  useEffect(() => {
    fetchVeiculoData();
  }, [fetchVeiculoData]);

  // Handlers genéricos
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({
      ...prev,
      [name]: name === 'placa' ? value.toUpperCase().trim() : value,
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };
  const handleOpenRemoveAnexoModal = (a: Anexo) => {
    setAnexoToDelete(a);
    setIsAnexoConfirmModalOpen(true);
  };
  const executeDeleteAnexo = async () => {
    if (!anexoToDelete) return;
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: anexoToDelete.filePath }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao remover anexo.');
      setFormData(prev => ({
        ...prev,
        anexos: prev.anexos.filter(a => a.filePath !== anexoToDelete.filePath),
      }));
      setFeedback({ type: 'success', message: 'Anexo removido!' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsAnexoConfirmModalOpen(false);
      setAnexoToDelete(null);
    }
  };
  const handleRemoveNewFile = (f: File) => {
    setSelectedFiles(prev => prev.filter(x => x !== f));
  };

  // Validação
  const validateForm = () => {
    const errs: Record<string,string> = {};
    const required: Record<string,string> = {
      placa: 'Placa', renavam: 'Renavam', chassi: 'Chassi',
      marca: 'Marca', modelo: 'Modelo', ano_fabricacao: 'Ano Fabricação',
      ano_modelo: 'Ano Modelo', cor: 'Cor', estado_uf: 'UF',
      cidade: 'Cidade', status_veiculo: 'Status', empresa_responsavel: 'Empresa',
      gestor_responsavel: 'Gestor', apoio_gestao: 'Apoio da Gestão',
      centro_custo_veiculo: 'Centro de Custo', finalidade: 'Finalidade',
      locadora: 'Locadora', data_disponibilizacao: 'Data Disponibilização',
      data_prevista_devolucao: 'Data Devolução Prevista',
    };
    Object.entries(required).forEach(([k, label]) => {
      if (!formData[k as keyof VeiculoFormData]) errs[k] = `O campo ${label} é obrigatório.`;
    });
    if (!valorMensalNumeric) errs.valor_mensal = 'Valor Mensal é obrigatório.';
    return errs;
  };

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    // Upload novos anexos
    let anexosAtual = [...formData.anexos];
    if (selectedFiles.length) {
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append('files', f));
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await up.json();
      if (!up.ok) {
        setFeedback({ type: 'error', message: json.error || 'Falha no upload.' });
        setIsSubmitting(false);
        return;
      }
      anexosAtual = anexosAtual.concat(json.files);
    }
    // Prepara payload
    const payload = {
      ...formData,
      valor_mensal: valorMensalNumeric,
      anexos: anexosAtual,
      ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
      ano_modelo: formData.ano_modelo ? parseInt(formData.ano_modelo) : null,
      periodo_contrato_meses: formData.periodo_contrato_meses
        ? parseInt(formData.periodo_contrato_meses)
        : null,
    };
    // Remove strings vazias
    Object.entries(payload).forEach(([k,v]) => { if (v === '') (payload as any)[k] = null });
    // Envia
    try {
      const res = await fetch(`/api/veiculos/${veiculoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erro na atualização.');
      setFeedback({ type: 'success', message: 'Atualizado! Redirecionando...' });
      setTimeout(() => router.push(`/veiculos/${veiculoId}`), 1500);
    } catch (e:any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content-area">
        <div className="card">Carregando dados para edição...</div>
      </div>
    );
  }

  const renderError = (field: string) =>
    errors[field] ? (
      <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>
        {errors[field]}
      </small>
    ) : null;

  const pageActions = (
    <>
      <Link href={`/veiculos/${veiculoId}`} className="btn btn-secondary">Cancelar</Link>
      <button type="submit" form="edit-vehicle-form" className="btn btn-primary" disabled={isSubmitting}>
        <IconSalvar /> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </>
  );

  return (
    <FormPageLayout
      title="Editar Veículo"
      subtitle={<>Altere os dados do veículo <span style={{ color: 'var(--magnum-red)', fontWeight: 500 }}>{formData.placa}</span></>}
      backLink={`/veiculos/${veiculoId}`}
      actions={pageActions}
      feedback={feedback}
    >
      <form id="edit-vehicle-form" onSubmit={handleSubmit}>
        {/* === Identificação do Veículo === */}
        <div className="form-section">
          <h2 className="section-title">Identificação do Veículo</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label>Placa *</label>
              <input name="placa" value={formData.placa} onChange={handleChange} />
              {renderError('placa')}
            </div>
            <div className="form-item">
              <label>Renavam *</label>
              <input name="renavam" value={formData.renavam} onChange={handleChange} />
              {renderError('renavam')}
            </div>
            <div className="form-item">
              <label>Chassi *</label>
              <input name="chassi" value={formData.chassi} onChange={handleChange} />
              {renderError('chassi')}
            </div>
            <div className="form-item">
              <label>Marca *</label>
              <input name="marca" value={formData.marca} onChange={handleChange} />
              {renderError('marca')}
            </div>
            <div className="form-item">
              <label>Modelo *</label>
              <input name="modelo" value={formData.modelo} onChange={handleChange} />
              {renderError('modelo')}
            </div>
            <div className="form-item">
              <label>Ano Fabricação *</label>
              <input type="number" name="ano_fabricacao" value={formData.ano_fabricacao} onChange={handleChange} />
              {renderError('ano_fabricacao')}
            </div>
            <div className="form-item">
              <label>Ano Modelo *</label>
              <input type="number" name="ano_modelo" value={formData.ano_modelo} onChange={handleChange} />
              {renderError('ano_modelo')}
            </div>
            <div className="form-item">
              <label>Cor *</label>
              <input name="cor" value={formData.cor} onChange={handleChange} />
              {renderError('cor')}
            </div>
            <div className="form-item">
              <label>Estado (UF) *</label>
              <input name="estado_uf" value={formData.estado_uf} onChange={handleChange} maxLength={2} />
              {renderError('estado_uf')}
            </div>
            <div className="form-item">
              <label>Cidade *</label>
              <input name="cidade" value={formData.cidade} onChange={handleChange} />
              {renderError('cidade')}
            </div>
          </div>
        </div>

        {/* === Informações Administrativas === */}
        <div className="form-section">
          <h2 className="section-title">Informações Administrativas e de Uso</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label>Status do Veículo *</label>
              <select name="status_veiculo" value={formData.status_veiculo} onChange={handleChange}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {renderError('status_veiculo')}
            </div>
            <div className="form-item">
              <label>Empresa Responsável *</label>
              <input name="empresa_responsavel" value={formData.empresa_responsavel} onChange={handleChange} />
              {renderError('empresa_responsavel')}
            </div>
            <div className="form-item">
              <label>Gestor Responsável *</label>
              <input name="gestor_responsavel" value={formData.gestor_responsavel} onChange={handleChange} />
              {renderError('gestor_responsavel')}
            </div>
            <div className="form-item">
              <label>Apoio da Gestão *</label>
              <input name="apoio_gestao" value={formData.apoio_gestao} onChange={handleChange} />
              {renderError('apoio_gestao')}
            </div>
            <div className="form-item">
              <label>Centro de Custo *</label>
              <input name="centro_custo_veiculo" value={formData.centro_custo_veiculo} onChange={handleChange} />
              {renderError('centro_custo_veiculo')}
            </div>
            <div className="form-item">
              <label>Finalidade *</label>
              <select name="finalidade" value={formData.finalidade} onChange={handleChange}>
                <option value="">Selecione</option>
                {finalidadeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {renderError('finalidade')}
            </div>
          </div>
        </div>

        {/* === Contrato e Locação === */}
        <div className="form-section">
          <h2 className="section-title">Contrato e Locação</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label>Locadora *</label>
              <input name="locadora" value={formData.locadora} onChange={handleChange} />
              {renderError('locadora')}
            </div>
            <div className="form-item">
              <label>Valor Mensal (R$) *</label>
              <input
                name="valor_mensal"
                value={valorMensalDisplay}
                onChange={handleValorMensalChange}
                placeholder="0,00"
              />
              {renderError('valor_mensal')}
            </div>
            <div className="form-item">
              <label>Período Contrato (Meses)</label>
              <input
                type="number"
                name="periodo_contrato_meses"
                value={formData.periodo_contrato_meses}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label>Data Disponibilização *</label>
              <input
                type="date"
                name="data_disponibilizacao"
                value={formData.data_disponibilizacao}
                onChange={handleChange}
              />
              {renderError('data_disponibilizacao')}
            </div>
            <div className="form-item">
              <label>Data Devolução Prevista *</label>
              <input
                type="date"
                name="data_prevista_devolucao"
                value={formData.data_prevista_devolucao}
                onChange={handleChange}
              />
              {renderError('data_prevista_devolucao')}
            </div>
          </div>
        </div>

        {/* === Anexos === */}
        <div className="form-section">
          <h2 className="section-title">Anexos do Veículo</h2>
          {formData.anexos.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
              {formData.anexos.map((a, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a href={a.url} className="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                    {a.fileName}
                  </a>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleOpenRemoveAnexoModal(a)}
                    title="Remover Anexo"
                  >
                    <IconRemoverAnexo />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="form-item">
            <label className="file-input-container">
              <span className="btn btn-secondary">
                <IconAnexo /> {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s)` : 'Escolher arquivos'}
              </span>
              <input type="file" multiple onChange={handleFileChange} className="visually-hidden" />
            </label>
            {selectedFiles.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                {selectedFiles.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{f.name}</span>
                    <button type="button" className="btn-icon" onClick={() => handleRemoveNewFile(f)} title="Remover">
                      <IconRemoverAnexo />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* === Observação Geral === */}
        <div className="form-section">
          <h2 className="section-title">Observação Geral</h2>
          <div className="form-item">
            <textarea
              name="observacao_geral"
              value={formData.observacao_geral}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>
      </form>

      <ConfirmationModal
        isOpen={isAnexoConfirmModalOpen}
        onClose={() => setIsAnexoConfirmModalOpen(false)}
        onConfirm={executeDeleteAnexo}
        title="Confirmar Remoção de Anexo"
        message={`Remover o anexo "${anexoToDelete?.fileName}"? Esta ação não pode ser desfeita.`}
        confirmButtonText="Sim, remover"
        cancelButtonText="Cancelar"
      />
    </FormPageLayout>
  );
}
