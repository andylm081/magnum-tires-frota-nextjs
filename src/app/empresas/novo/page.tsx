// src/app/empresas/novo/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';

// Ícones
const IconSalvar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;
const IconRemoverAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;

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
}

export default function NovaEmpresaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EmpresaFormData>({
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof EmpresaFormData, string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name as keyof EmpresaFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveNewFile = (fileToRemove: File) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EmpresaFormData, string>> = {};
    if (!formData.razao_social) newErrors.razao_social = "O campo Razão Social é obrigatório.";
    if (!formData.cnpj) newErrors.cnpj = "O campo CNPJ é obrigatório.";
    if (!formData.cidade) newErrors.cidade = "O campo Cidade é obrigatório.";
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    let uploadedFiles = [];
    if (selectedFiles.length > 0) {
        setFeedback({ type: 'info', message: `A enviar ${selectedFiles.length} anexo(s)...` });
        const fileFormData = new FormData();
        selectedFiles.forEach(file => { fileFormData.append('files', file); });

        try {
            const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fileFormData });
            const uploadResult = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadResult.error || 'Falha no upload dos anexos.');
            uploadedFiles = uploadResult.files;
        } catch (uploadError: any) {
            setFeedback({ type: 'error', message: uploadError.message });
            setIsSubmitting(false);
            return;
        }
    }

    const payload = { ...formData, anexos: uploadedFiles };
    
    Object.keys(payload).forEach(key => {
        if ((payload as any)[key] === '') (payload as any)[key] = null;
    });

    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao criar a empresa.');
      
      setFeedback({ type: 'success', message: 'Empresa adicionada com sucesso! Redirecionando...' });
      setTimeout(() => router.push('/empresas'), 2000);
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderError = (fieldName: keyof EmpresaFormData) => {
    if (errors[fieldName]) {
        return <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>{errors[fieldName]}</small>;
    }
    return null;
  };

  const pageActions = (
    <>
        <Link href="/empresas" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" form="add-company-form" className="btn btn-primary" disabled={isSubmitting}>
            <IconSalvar />
            {isSubmitting ? 'Adicionando...' : 'Adicionar Empresa'}
        </button>
    </>
  );

  return (
    <FormPageLayout
      title="Adicionar Nova Empresa"
      subtitle="Preencha os dados para registrar uma nova empresa."
      backLink="/empresas"
      actions={pageActions}
      feedback={feedback}
    >
      <form id="add-company-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">Dados da Empresa</h2>
            <div className="form-grid cols-3">
              <div className="form-item">
                <label htmlFor="razao_social">Razão Social <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
                <input type="text" id="razao_social" name="razao_social" value={formData.razao_social} onChange={handleChange} style={errors.razao_social ? { borderColor: 'var(--magnum-red-status)' } : {}}/>
                {renderError('razao_social')}
              </div>
              <div className="form-item"><label htmlFor="nome_fantasia">Nome Fantasia</label><input type="text" id="nome_fantasia" name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} /></div>
              <div className="form-item">
                <label htmlFor="cnpj">CNPJ <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
                <input type="text" id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} style={errors.cnpj ? { borderColor: 'var(--magnum-red-status)' } : {}}/>
                {renderError('cnpj')}
              </div>
              <div className="form-item"><label htmlFor="inscricao_estadual">Inscrição Estadual</label><input type="text" id="inscricao_estadual" name="inscricao_estadual" value={formData.inscricao_estadual} onChange={handleChange} /></div>
              <div className="form-item"><label htmlFor="inscricao_municipal">Inscrição Municipal</label><input type="text" id="inscricao_municipal" name="inscricao_municipal" value={formData.inscricao_municipal} onChange={handleChange} /></div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Endereço</h2>
            <div className="form-grid cols-4">
                <div className="form-item"><label htmlFor="cep">CEP</label><input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} /></div>
                <div className="form-item" style={{gridColumn: 'span 2'}}><label htmlFor="logradouro">Logradouro</label><input type="text" id="logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} /></div>
                <div className="form-item"><label htmlFor="numero">Número</label><input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} /></div>
                <div className="form-item"><label htmlFor="complemento">Complemento</label><input type="text" id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} /></div>
                <div className="form-item"><label htmlFor="bairro">Bairro</label><input type="text" name="bairro" id="bairro" value={formData.bairro} onChange={handleChange} /></div>
                <div className="form-item">
                  <label htmlFor="cidade">Cidade <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
                  <input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleChange} style={errors.cidade ? { borderColor: 'var(--magnum-red-status)' } : {}}/>
                  {renderError('cidade')}
                </div>
                <div className="form-item"><label htmlFor="uf">UF</label><input type="text" id="uf" name="uf" value={formData.uf} onChange={handleChange} maxLength={2} /></div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Anexos</h2>
            <div className="form-item">
              <label className="file-input-container">
                <span className="btn btn-secondary"><IconAnexo /> {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s)` : 'Escolher arquivos'}</span>
                <input type="file" multiple className="visually-hidden" onChange={handleFileChange} />
              </label>
              {selectedFiles.length > 0 && (
                <div style={{marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--magnum-text-light)'}}>
                    <p>Novos arquivos selecionados:</p>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {selectedFiles.map((file, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
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
          
          <div className="form-section">
            <h2 className="section-title">Observações</h2>
            <div className="form-item"><textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows={4}></textarea></div>
          </div>
        </form>
    </FormPageLayout>
  );
}
