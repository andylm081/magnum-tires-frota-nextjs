// src/app/empresas/[id]/editar/page.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  url: string;
  fileName: string;
  filePath: string;
}

interface EmpresaFormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes: string;
  anexos: Anexo[];
}

const initialFormState: EmpresaFormData = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  observacoes: '',
  anexos: [],
};

export default function EditarEmpresaPage() {
  const router = useRouter();
  const params = useParams() as { id?: string | string[] };
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [formData, setFormData] = useState<EmpresaFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type:string;message:string}>({ type: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof EmpresaFormData,string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnexoConfirmModalOpen, setIsAnexoConfirmModalOpen] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<Anexo | null>(null);

  const fetchEmpresaData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/empresas/${id}`);
      if (!res.ok) throw new Error('Falha ao buscar dados da empresa.');
      const data = await res.json();
      // Prefill only known keys:
      const prefilled: EmpresaFormData = { ...initialFormState };
      Object.keys(prefilled).forEach(key => {
        if (key === 'anexos') {
          prefilled.anexos = Array.isArray(data.anexos)
            ? data.anexos.map((a: any) => ({
                url: a.url || '',
                fileName: a.fileName || '',
                filePath: a.filePath || ''
              }))
            : [];
        } else {
          // @ts-ignore
          prefilled[key] = data[key] ?? '';
        }
      });
      setFormData(prefilled);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmpresaData();
  }, [fetchEmpresaData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleOpenRemoveAnexoModal = (filePath: string, fileName: string) => {
    setAnexoToDelete({ filePath, fileName, url: '' });
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
      setFormData(prev => ({
        ...prev,
        anexos: prev.anexos.filter(a => a.filePath !== anexoToDelete.filePath)
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
    setSelectedFiles(prev => prev.filter(f => f !== file));
  };

  const validateForm = () => {
    const errs: Partial<Record<keyof EmpresaFormData,string>> = {};
    if (!formData.razao_social.trim()) errs.razao_social = 'Razão Social é obrigatória.';
    if (!formData.cnpj.trim())          errs.cnpj           = 'CNPJ é obrigatório.';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    const formErrs = validateForm();
    if (Object.keys(formErrs).length) {
      setErrors(formErrs);
      return;
    }
    setIsSubmitting(true);

    // Upload new attachments
    let anexosAtualizados = [...formData.anexos];
    if (selectedFiles.length) {
      setFeedback({ type: 'info', message: `Enviando ${selectedFiles.length} anexo(s)...` });
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append('files', f));
      try {
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const { files } = await upRes.json();
        if (!upRes.ok) throw new Error('Falha no upload dos anexos.');
        anexosAtualizados = anexosAtualizados.concat(files);
      } catch (e: any) {
        setFeedback({ type: 'error', message: e.message });
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare payload
    const payload = { ...formData, anexos: anexosAtualizados };
    Object.entries(payload).forEach(([k,v]) => {
      if (v === '') (payload as any)[k] = null;
    });

    try {
      const res = await fetch(`/api/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Falha ao atualizar a empresa.');
      setFeedback({ type: 'success', message: 'Empresa atualizada com sucesso!' });
      setTimeout(() => router.push(`/empresas/${id}`), 2000);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content-area">
        <div className="card">Carregando dados da empresa...</div>
      </div>
    );
  }

  const pageActions = (
    <>
      <Link href={`/empresas/${id}`} className="btn btn-secondary">Cancelar</Link>
      <button
        form="edit-company-form"
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
      >
        <IconSalvar /> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </>
  );

  const renderError = (field: keyof EmpresaFormData) =>
    errors[field] ? (
      <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>
        {errors[field]}
      </small>
    ) : null;

  return (
    <FormPageLayout
      title="Editar Empresa"
      subtitle={
        <>
          Altere os dados da empresa{' '}
          <span style={{ color: 'var(--magnum-red)', fontWeight: 500 }}>
            {formData.razao_social}
          </span>
        </>
      }
      backLink={`/empresas/${id}`}
      actions={pageActions}
      feedback={feedback}
    >
      <form id="edit-company-form" onSubmit={handleSubmit}>
        {/* Dados Básicos */}
        <div className="form-section">
          <h2 className="section-title">Dados da Empresa</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="razao_social">
                Razão Social <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                id="razao_social"
                name="razao_social"
                type="text"
                value={formData.razao_social}
                onChange={handleChange}
                style={errors.razao_social ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('razao_social')}
            </div>
            <div className="form-item">
              <label htmlFor="nome_fantasia">Nome Fantasia</label>
              <input
                id="nome_fantasia"
                name="nome_fantasia"
                type="text"
                value={formData.nome_fantasia}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="cnpj">
                CNPJ <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                id="cnpj"
                name="cnpj"
                type="text"
                value={formData.cnpj}
                onChange={handleChange}
                style={errors.cnpj ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('cnpj')}
            </div>
            <div className="form-item">
              <label htmlFor="inscricao_estadual">Inscrição Estadual</label>
              <input
                id="inscricao_estadual"
                name="inscricao_estadual"
                type="text"
                value={formData.inscricao_estadual}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="inscricao_municipal">Inscrição Municipal</label>
              <input
                id="inscricao_municipal"
                name="inscricao_municipal"
                type="text"
                value={formData.inscricao_municipal}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="form-section">
          <h2 className="section-title">Endereço</h2>
          <div className="form-grid cols-4">
            <div className="form-item">
              <label htmlFor="cep">CEP</label>
              <input id="cep" name="cep" type="text" value={formData.cep} onChange={handleChange} />
            </div>
            <div className="form-item" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="logradouro">Logradouro</label>
              <input id="logradouro" name="logradouro" type="text" value={formData.logradouro} onChange={handleChange}/>
            </div>
            <div className="form-item">
              <label htmlFor="numero">Número</label>
              <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleChange}/>
            </div>
            <div className="form-item">
              <label htmlFor="complemento">Complemento</label>
              <input id="complemento" name="complemento" type="text" value={formData.complemento} onChange={handleChange}/>
            </div>
            <div className="form-item">
              <label htmlFor="bairro">Bairro</label>
              <input id="bairro" name="bairro" type="text" value={formData.bairro} onChange={handleChange}/>
            </div>
            <div className="form-item">
              <label htmlFor="cidade">Cidade</label>
              <input id="cidade" name="cidade" type="text" value={formData.cidade} onChange={handleChange}/>
            </div>
            <div className="form-item">
              <label htmlFor="uf">UF</label>
              <input id="uf" name="uf" type="text" value={formData.uf} onChange={handleChange} maxLength={2}/>
            </div>
          </div>
        </div>

        {/* Anexos */}
        <div className="form-section">
          <h2 className="section-title">Anexos</h2>
          {formData.anexos.length > 0 && (
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 'var(--space-4)' }}>
              {formData.anexos.map((anexo, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
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
              <input type="file" multiple className="visually-hidden" onChange={handleFileChange}/>
            </label>
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--magnum-text-light)' }}>
                <p>Novos arquivos selecionados:</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {selectedFiles.map((file, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
        message={
          anexoToDelete
            ? `Tem certeza que deseja remover o anexo "${anexoToDelete.fileName}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmButtonText="Sim, Remover"
        cancelButtonText="Cancelar"
      />
    </FormPageLayout>
  );
}
