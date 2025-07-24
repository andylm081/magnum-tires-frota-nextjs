// src/app/condutores/novo/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import { supabase } from '@/lib/supabaseClient';
import { IMaskInput } from 'react-imask';

// Ícones
const IconSalvar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;
const IconRemoverAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;


export default function PaginaNovoCondutor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
    empresa_filial_nome: '', // CORRIGIDO: Nome do campo alinhado com a base de dados
    cargo: '',
    departamento: '',
    gestor_responsavel: '',
    centro_custo_condutor: '',
    status_condutor: 'Ativo',
    observacoes: '',
  });
  const [empresas, setEmpresas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchEmpresas = async () => {
        try {
            const { data, error } = await supabase.from('empresas').select('razao_social');
            if (error) throw error;
            setEmpresas(data);
        } catch (error) {
            console.error("Erro ao buscar empresas:", error);
            setFeedback({ type: 'error', message: 'Não foi possível carregar a lista de empresas.' });
        }
    };
    fetchEmpresas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
        setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveNewFile = (fileToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome_completo) newErrors.nome_completo = "O campo Nome Completo é obrigatório.";
    if (!formData.cnh_numero) newErrors.cnh_numero = "O campo N° da CNH é obrigatório.";
    if (!formData.validade_cnh) newErrors.validade_cnh = "O campo Validade da CNH é obrigatório.";
    if (!formData.cpf) newErrors.cpf = "O campo CPF é obrigatório.";
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        } catch (uploadError) {
            setFeedback({ type: 'error', message: uploadError.message });
            setIsSubmitting(false);
            return;
        }
    }

    const payload = { ...formData, anexos: uploadedFiles };
    
    Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
    });

    try {
      const response = await fetch('/api/condutores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao criar o condutor.');
      
      setFeedback({ type: 'success', message: 'Condutor adicionado com sucesso! Redirecionando...' });
      setTimeout(() => router.push('/condutores'), 2000);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageActions = (
    <>
      <Link href="/condutores" className="btn btn-secondary">Cancelar</Link>
      <button type="submit" form="add-driver-form" className="btn btn-primary" disabled={isSubmitting}>
        <IconSalvar />
        {isSubmitting ? 'Adicionando...' : 'Adicionar Condutor'}
      </button>
    </>
  );

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
        return <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>{errors[fieldName]}</small>;
    }
    return null;
  };

  return (
    <FormPageLayout
      title="Adicionar Novo Condutor"
      subtitle="Preencha os dados abaixo para registrar um novo condutor."
      backLink="/condutores"
      actions={pageActions}
      feedback={feedback}
    >
      <form id="add-driver-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Informações Pessoais</h2>
          <div className="form-grid cols-3">
            <div className="form-item"><label htmlFor="nome_completo">Nome Completo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="nome_completo" id="nome_completo" value={formData.nome_completo} onChange={handleChange} style={errors.nome_completo ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('nome_completo')}</div>
            <div className="form-item"><label htmlFor="data_nascimento">Data de Nascimento</label><input type="date" name="data_nascimento" id="data_nascimento" value={formData.data_nascimento} onChange={handleChange} /></div>
            <div className="form-item">
              <label htmlFor="cpf">CPF <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
              <IMaskInput
                mask="000.000.000-00"
                value={formData.cpf}
                onAccept={(value) => handleChange({ target: { name: 'cpf', value } })}
                placeholder="000.000.000-00"
                style={errors.cpf ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('cpf')}
            </div>
            <div className="form-item"><label htmlFor="rg">RG</label><input type="text" name="rg" id="rg" value={formData.rg} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Documento de Habilitação</h2>
          <div className="form-grid cols-3">
            <div className="form-item"><label htmlFor="cnh_numero">Nº da CNH <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="cnh_numero" id="cnh_numero" value={formData.cnh_numero} onChange={handleChange} style={errors.cnh_numero ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('cnh_numero')}</div>
            <div className="form-item"><label htmlFor="validade_cnh">Validade da CNH <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="date" name="validade_cnh" id="validade_cnh" value={formData.validade_cnh} onChange={handleChange} style={errors.validade_cnh ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('validade_cnh')}</div>
            <div className="form-item"><label htmlFor="categoria_cnh">Categoria</label><input type="text" name="categoria_cnh" id="categoria_cnh" value={formData.categoria_cnh} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Endereço e Contato</h2>
          <div className="form-grid cols-3">
            <div className="form-item"><label htmlFor="cep">CEP</label><input type="text" name="cep" id="cep" value={formData.cep} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="endereco">Endereço</label><input type="text" name="endereco" id="endereco" value={formData.endereco} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="cidade">Cidade</label><input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="estado">Estado</label><input type="text" name="estado" id="estado" value={formData.estado} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="telefone">Telefone</label><input type="text" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="email">E-mail</label><input type="email" name="email" id="email" value={formData.email} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Informações Corporativas</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              {/* CORRIGIDO: 'name' e 'id' alterados para empresa_filial_nome */}
              <label htmlFor="empresa_filial_nome">Empresa</label>
              <select name="empresa_filial_nome" id="empresa_filial_nome" value={formData.empresa_filial_nome} onChange={handleChange}>
                <option value="">Selecione uma empresa</option>
                {empresas.map(e => <option key={e.razao_social} value={e.razao_social}>{e.razao_social}</option>)}
              </select>
            </div>
            <div className="form-item"><label htmlFor="cargo">Cargo</label><input type="text" name="cargo" id="cargo" value={formData.cargo} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="departamento">Departamento</label><input type="text" name="departamento" id="departamento" value={formData.departamento} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="gestor_responsavel">Gestor Responsável</label><input type="text" name="gestor_responsavel" id="gestor_responsavel" value={formData.gestor_responsavel} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="centro_custo_condutor">Centro de Custo</label><input type="text" name="centro_custo_condutor" id="centro_custo_condutor" value={formData.centro_custo_condutor} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="status_condutor">Status</label><select name="status_condutor" id="status_condutor" value={formData.status_condutor} onChange={handleChange}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option><option value="Férias">Férias</option><option value="Afastado">Afastado</option></select></div>
          </div>
        </div>

        <div className="form-section">
            <h2 className="section-title">Anexos do Condutor</h2>
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
          <div className="form-item">
            <textarea name="observacoes" id="observacoes" value={formData.observacoes} onChange={handleChange} rows={5}/>
          </div>
        </div>
      </form>
    </FormPageLayout>
  );
}
