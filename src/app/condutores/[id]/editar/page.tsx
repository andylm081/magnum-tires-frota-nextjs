// src/app/condutores/[id]/editar/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { supabase } from '@/lib/supabaseClient';
import { IMaskInput } from 'react-imask';

// Ícones
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

interface Anexo {
  fileName: string;
  filePath: string;
  url: string;
}

interface CondutorForm {
  nome_completo: string;
  cnh_numero: string;
  validade_cnh: string;
  categoria_cnh: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  empresa_filial_nome: string;
  cargo: string;
  departamento: string;
  gestor_responsavel: string;
  centro_custo_condutor: string;
  status_condutor: string;
  observacoes: string;
  anexos: Anexo[];
}

const initialFormState: CondutorForm = {
  nome_completo: '',
  cnh_numero: '',
  validade_cnh: '',
  categoria_cnh: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  telefone: '',
  email: '',
  empresa_filial_nome: '',
  cargo: '',
  departamento: '',
  gestor_responsavel: '',
  centro_custo_condutor: '',
  status_condutor: 'Ativo',
  observacoes: '',
  anexos: [],
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(
      dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'
    );
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export default function PaginaEditarCondutor() {
  const router = useRouter();
  const params = useParams();
  const condutorId = params?.id;

  const [formData, setFormData] = useState<CondutorForm>(initialFormState);
  const [empresas, setEmpresas] = useState<{ razao_social: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnexoConfirmModalOpen, setIsAnexoConfirmModalOpen] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<{ filePath: string; fileName: string } | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!condutorId) return;
    setIsLoading(true);
    try {
      const condutorPromise = supabase.from('condutores').select('*').eq('id', condutorId).single();
      const empresasPromise = supabase.from('empresas').select('razao_social');
      const [condutorResult, empresasResult] = await Promise.all([condutorPromise, empresasPromise]);

      if (condutorResult.error) throw new Error('Falha ao buscar dados do condutor.');
      if (empresasResult.error) throw new Error('Falha ao buscar empresas.');

      const prefilled: CondutorForm = { ...initialFormState };
      Object.keys(condutorResult.data).forEach((key) => {
        if (key in prefilled) {
          // @ts-ignore
          prefilled[key] = ['validade_cnh','data_nascimento'].includes(key)
            ? formatDateForInput(condutorResult.data[key])
            : condutorResult.data[key] ?? '';
        }
      });
      prefilled.anexos = Array.isArray(condutorResult.data.anexos)
        ? condutorResult.data.anexos
        : [];
      setFormData(prefilled);
      setEmpresas(empresasResult.data);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [condutorId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handler genérico para inputs/selects/textareas
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers para campos mascarados
  const handleCpfAccept = (value: string) => setFormData((prev) => ({ ...prev, cpf: value }));
  const handleTelefoneAccept = (value: string) => setFormData((prev) => ({ ...prev, telefone: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleOpenRemoveAnexoModal = (filePath: string, fileName: string) => {
    setAnexoToDelete({ filePath, fileName });
    setIsAnexoConfirmModalOpen(true);
  };

  const executeDeleteAnexo = async () => {
    if (!anexoToDelete) return;
    setFeedback({ type: 'info', message: 'Removendo anexo...' });
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: anexoToDelete.filePath }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao remover anexo.');
      setFormData((prev) => ({
        ...prev,
        anexos: prev.anexos.filter((a) => a.filePath !== anexoToDelete.filePath),
      }));
      setFeedback({ type: 'success', message: 'Anexo removido!' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsAnexoConfirmModalOpen(false);
      setAnexoToDelete(null);
    }
  };

  const handleRemoveNewFile = (file: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.nome_completo) errs.nome_completo = 'Nome Completo é obrigatório.';
    if (!formData.cnh_numero) errs.cnh_numero = 'Nº da CNH é obrigatório.';
    if (!formData.validade_cnh) errs.validade_cnh = 'Validade da CNH é obrigatória.';
    if (!formData.cpf) errs.cpf = 'CPF é obrigatório.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    const formErrors = validateForm();
    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      return;
    }
    setIsSubmitting(true);

    // Upload de novos anexos
    let anexosAtualizados = [...formData.anexos];
    if (selectedFiles.length) {
      setFeedback({ type: 'info', message: `Enviando ${selectedFiles.length} anexo(s)...` });
      const fd = new FormData();
      selectedFiles.forEach((f) => fd.append('files', f));
      try {
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || 'Falha no upload.');
        anexosAtualizados.push(...upJson.files);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message });
        setIsSubmitting(false);
        return;
      }
    }

    // Monta payload, convertendo strings vazias em null
    const payload = { ...formData, anexos: anexosAtualizados };
    Object.entries(payload).forEach(([k, v]) => {
      if (v === '') (payload as any)[k] = null;
    });

    try {
      const res = await fetch(`/api/condutores/${condutorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Falha ao atualizar.');
      setFeedback({ type: 'success', message: 'Condutor atualizado! Redirecionando...' });
      setTimeout(() => router.push(`/condutores/${condutorId}`), 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content-area">
        <div className="card">Carregando dados do condutor...</div>
      </div>
    );
  }

  const pageActions = (
    <>
      <Link href={`/condutores/${condutorId}`} className="btn btn-secondary">
        Cancelar
      </Link>
      <button type="submit" form="edit-driver-form" className="btn btn-primary" disabled={isSubmitting}>
        <IconSalvar /> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </>
  );

  const renderError = (field: string) =>
    errors[field] ? (
      <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>
        {errors[field]}
      </small>
    ) : null;

  return (
    <FormPageLayout
      title="Editar Condutor"
      subtitle={
        <>
          Altere os dados de{' '}
          <span style={{ color: 'var(--magnum-red)', fontWeight: 500 }}>
            {formData.nome_completo}
          </span>
        </>
      }
      backLink={`/condutores/${condutorId}`}
      actions={pageActions}
      feedback={feedback}
    >
      <form id="edit-driver-form" onSubmit={handleSubmit}>
        
        {/* Informações Pessoais */}
        <div className="form-section">
          <h2 className="section-title">Informações Pessoais</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="nome_completo">
                Nome Completo <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                type="text"
                id="nome_completo"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                style={errors.nome_completo ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('nome_completo')}
            </div>
            <div className="form-item">
              <label htmlFor="data_nascimento">Data de Nascimento</label>
              <input
                type="date"
                id="data_nascimento"
                name="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="cpf">
                CPF <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <IMaskInput
                mask="000.000.000-00"
                value={formData.cpf}
                onAccept={handleCpfAccept}
                placeholder="000.000.000-00"
                style={errors.cpf ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('cpf')}
            </div>
            <div className="form-item">
              <label htmlFor="rg">RG</label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Documento de Habilitação */}
        <div className="form-section">
          <h2 className="section-title">Documento de Habilitação</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="cnh_numero">
                Nº da CNH <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                type="text"
                id="cnh_numero"
                name="cnh_numero"
                value={formData.cnh_numero}
                onChange={handleChange}
                style={errors.cnh_numero ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('cnh_numero')}
            </div>
            <div className="form-item">
              <label htmlFor="validade_cnh">
                Validade da CNH <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                type="date"
                id="validade_cnh"
                name="validade_cnh"
                value={formData.validade_cnh}
                onChange={handleChange}
                style={errors.validade_cnh ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('validade_cnh')}
            </div>
            <div className="form-item">
              <label htmlFor="categoria_cnh">Categoria</label>
              <input
                type="text"
                id="categoria_cnh"
                name="categoria_cnh"
                value={formData.categoria_cnh}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Endereço e Contato */}
        <div className="form-section">
          <h2 className="section-title">Endereço e Contato</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="cep">CEP</label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="endereco">Endereço</label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="cidade">Cidade</label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="estado">Estado</label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="telefone">Telefone</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={formData.telefone}
                onAccept={handleTelefoneAccept}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="form-item">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Informações Corporativas */}
        <div className="form-section">
          <h2 className="section-title">Informações Corporativas</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="empresa_filial_nome">Empresa</label>
              <select
                id="empresa_filial_nome"
                name="empresa_filial_nome"
                value={formData.empresa_filial_nome}
                onChange={handleChange}
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((e) => (
                  <option key={e.razao_social} value={e.razao_social}>
                    {e.razao_social}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="cargo">Cargo</label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="departamento">Departamento</label>
              <input
                type="text"
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="gestor_responsavel">Gestor Responsável</label>
              <input
                type="text"
                id="gestor_responsavel"
                name="gestor_responsavel"
                value={formData.gestor_responsavel}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="centro_custo_condutor">Centro de Custo</label>
              <input
                type="text"
                id="centro_custo_condutor"
                name="centro_custo_condutor"
                value={formData.centro_custo_condutor}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="status_condutor">Status</label>
              <select
                id="status_condutor"
                name="status_condutor"
                value={formData.status_condutor}
                onChange={handleChange}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Férias">Férias</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Anexos */}
        <div className="form-section">
          <h2 className="section-title">Anexos do Condutor</h2>
          {formData.anexos.length > 0 && (
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 'var(--space-4)' }}>
              {formData.anexos.map((anexo, idx) => (
                <li
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}
                >
                  <a
                    href={anexo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    {anexo.fileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenRemoveAnexoModal(anexo.filePath, anexo.fileName)}
                    className="btn-icon"
                    title="Remover anexo"
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
              <input type="file" multiple className="visually-hidden" onChange={handleFileChange} />
            </label>
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--magnum-text-light)' }}>
                <p>Novos arquivos selecionados:</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {selectedFiles.map((file, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span>- {file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(file)}
                        className="btn-icon"
                        title="Remover seleção"
                      >
                        <IconRemoverAnexo />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Observações */}
        <div className="form-section">
          <h2 className="section-title">Observações</h2>
          <div className="form-item">
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={5}
            />
          </div>
        </div>

      </form>
      
      <ConfirmationModal
        isOpen={isAnexoConfirmModalOpen}
        onClose={() => setIsAnexoConfirmModalOpen(false)}
        onConfirm={executeDeleteAnexo}
        title="Confirmar Remoção de Anexo"
        message={anexoToDelete ? `Tem certeza que deseja remover o anexo "${anexoToDelete.fileName}"? Esta ação não pode ser desfeita.` : ''}
        confirmButtonText="Sim, Remover"
        cancelButtonText="Cancelar"
      />
    </FormPageLayout>
  );
}
