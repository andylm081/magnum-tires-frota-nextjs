"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';

// Ícones
const IconEditar = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconExcluir = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconVoltar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const IconChecklist = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.03 5.29L12.75 13.58l-3.29-3.29c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4 4c.39.39 1.02.39 1.41 0l9-9c.39-.39.39-1.02 0-1.41s-1.03-.39-1.42 0zM5 19h14v2H5zM5 15h14v2H5zM5 11h6v2H5zM5 7h6v2H5z"/></svg>;
const IconCarro = ({ style }: { style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor" style={style}>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
const IconContrato = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;
const IconRemoverAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 1 0-1.41 1.42l4.89 4.88-4.89 4.88a1 1 0 1 0 1.41 1.42l4.89-4.89 4.89 4.89a1 1 0 0 0 1.41-1.42l-4.89-4.88 4.89-4.88a1 1 0 0 0 0-1.42z"/></svg>;
const IconSalvar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10m0-2H7a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4Z"/></svg>;

const statusOptions = ['Disponível', 'Em uso', 'Em manutenção', 'Devolvido'];
const finalidadeOptions = ['COMERCIAL', 'CTC', 'USO DA UNIDADE (FILIAL)'];

// Tipagem do formulário
interface VeiculoFormData {
  placa: string;
  renavam: string;
  chassi: string;
  empresa_responsavel: string;
  marca: string;
  modelo: string;
  ano_fabricacao: string;
  ano_modelo: string;
  cor: string;
  status_veiculo: string;
  gestor_responsavel: string;
  apoio_gestao: string;
  centro_custo_veiculo: string;
  finalidade: string;
  locadora: string;
  periodo_contrato_meses: string;
  data_disponibilizacao: string;
  data_prevista_devolucao: string;
  estado_uf: string;
  cidade: string;
  observacao_geral: string;
}

export default function PaginaNovoVeiculo() {
  const router = useRouter();
  const [formData, setFormData] = useState<VeiculoFormData>({
    placa: '', renavam: '', chassi: '', empresa_responsavel: '', marca: '', modelo: '',
    ano_fabricacao: '', ano_modelo: '', cor: '', status_veiculo: 'Disponível',
    gestor_responsavel: '', apoio_gestao: '', centro_custo_veiculo: '',
    finalidade: '', locadora: '', periodo_contrato_meses: '',
    data_disponibilizacao: '', data_prevista_devolucao: '',
    estado_uf: '', cidade: '', observacao_geral: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { 
    displayValue: valorMensalDisplay, 
    numericValue: valorMensalNumeric, 
    handleChange: handleValorMensalChange 
  } = useCurrencyInput();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setFormData(prevState => ({ ...prevState, [name]: name === 'placa' ? value.toUpperCase().trim() : value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveNewFile = (fileToRemove: File) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = {
        placa: 'Placa', renavam: 'Renavam', chassi: 'Chassi', marca: 'Marca', modelo: 'Modelo',
        ano_fabricacao: 'Ano Fabricação', ano_modelo: 'Ano Modelo', cor: 'Cor', estado_uf: 'Estado (UF)',
        cidade: 'Cidade', status_veiculo: 'Status do Veículo', empresa_responsavel: 'Empresa Responsável',
        gestor_responsavel: 'Gestor Responsável', centro_custo_veiculo: 'Centro de Custo',
        finalidade: 'Finalidade', locadora: 'Locadora', data_disponibilizacao: 'Data de Disponibilização',
        data_prevista_devolucao: 'Data de Devolução Prevista', apoio_gestao: 'Apoio da Gestão'
    };
    
    for (const field in requiredFields) {
        if (!formData[field as keyof VeiculoFormData]) {
            newErrors[field] = `O campo ${requiredFields[field as keyof typeof requiredFields]} é obrigatório.`;
        }
    }

    if (!valorMensalNumeric) {
        newErrors.valor_mensal = "O campo Valor Mensal é obrigatório.";
    }

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
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
        } catch (uploadError: any) {
            setFeedback({ type: 'error', message: uploadError.message });
            setIsSubmitting(false);
            return;
        }
    }

    const payload = { 
    ...formData, 
    valor_mensal: valorMensalNumeric,
    anexos: uploadedFiles,
    ativo: true, // Define 'ativo' como true por padrão ao criar
    ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao, 10) : null,
    ano_modelo: formData.ano_modelo ? parseInt(formData.ano_modelo, 10) : null,
    periodo_contrato_meses: formData.periodo_contrato_meses ? parseInt(formData.periodo_contrato_meses, 10) : null,
};


    try {
      const response = await fetch('/api/veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json(); 
      if (!response.ok) throw new Error(result.message || `Erro HTTP! Status: ${response.status}.`);
      
      setFeedback({type: 'success', message: "Veículo adicionado com sucesso! Redirecionando..."});
      setTimeout(() => { router.push('/veiculos'); }, 2000);
    } catch (e: any) {
      setFeedback({type: 'error', message: e.message || "Ocorreu um erro desconhecido ao salvar o veículo."});
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageActions = (
    <>
      <Link href="/veiculos" className="btn btn-secondary">Cancelar</Link>
      <button type="submit" form="add-vehicle-form" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <IconCarro style={{ marginRight: '8px', verticalAlign: 'middle', fontSize: '20px', fill: '#fff' }} />
  {isSubmitting ? 'Adicionando...' : 'Adicionar Veículo'}
</button>
    </>
  );
  
  const renderError = (fieldName: string) => {
      if (errors[fieldName]) {
          return <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>{errors[fieldName]}</small>;
      }
      return null;
  };

  return (
    <FormPageLayout
      title="Adicionar Novo Veículo"
      subtitle="Preencha os dados abaixo para registar um novo veículo na frota."
      backLink="/veiculos"
      actions={pageActions}
      feedback={feedback}
    >
      <form id="add-vehicle-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Identificação do Veículo</h2>
          <div className="form-grid cols-3">
            <div className="form-item"><label htmlFor="placa">Placa <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="placa" id="placa" value={formData.placa} onChange={handleChange} style={errors.placa ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('placa')}</div>
            <div className="form-item"><label htmlFor="renavam">Renavam <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="renavam" id="renavam" value={formData.renavam} onChange={handleChange} style={errors.renavam ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('renavam')}</div>
            <div className="form-item"><label htmlFor="chassi">Chassi <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="chassi" id="chassi" value={formData.chassi} onChange={handleChange} style={errors.chassi ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('chassi')}</div>
            <div className="form-item"><label htmlFor="marca">Marca <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="marca" id="marca" value={formData.marca} onChange={handleChange} style={errors.marca ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('marca')}</div>
            <div className="form-item"><label htmlFor="modelo">Modelo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="modelo" id="modelo" value={formData.modelo} onChange={handleChange} style={errors.modelo ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('modelo')}</div>
            <div className="form-item"><label htmlFor="ano_fabricacao">Ano Fabricação <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="number" name="ano_fabricacao" id="ano_fabricacao" value={formData.ano_fabricacao} onChange={handleChange} placeholder="AAAA" style={errors.ano_fabricacao ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('ano_fabricacao')}</div>
            <div className="form-item"><label htmlFor="ano_modelo">Ano Modelo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="number" name="ano_modelo" id="ano_modelo" value={formData.ano_modelo} onChange={handleChange} placeholder="AAAA" style={errors.ano_modelo ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('ano_modelo')}</div>
            <div className="form-item"><label htmlFor="cor">Cor <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="cor" id="cor" value={formData.cor} onChange={handleChange} style={errors.cor ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('cor')}</div>
            <div className="form-item"><label htmlFor="estado_uf">Estado (UF) <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="estado_uf" id="estado_uf" value={formData.estado_uf} onChange={handleChange} maxLength={2} placeholder="PE" style={errors.estado_uf ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('estado_uf')}</div>
            <div className="form-item"><label htmlFor="cidade">Cidade <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="cidade" id="cidade" value={formData.cidade} onChange={handleChange} style={errors.cidade ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('cidade')}</div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Informações Administrativas e de Uso</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="status_veiculo">Status do Veículo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
              <select name="status_veiculo" id="status_veiculo" value={formData.status_veiculo} onChange={handleChange} style={errors.status_veiculo ? { borderColor: 'var(--magnum-red-status)' } : {}}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {renderError('status_veiculo')}
            </div>
            <div className="form-item"><label htmlFor="empresa_responsavel">Empresa Responsável <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="empresa_responsavel" id="empresa_responsavel" value={formData.empresa_responsavel} onChange={handleChange} style={errors.empresa_responsavel ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('empresa_responsavel')}</div>
            <div className="form-item"><label htmlFor="gestor_responsavel">Gestor Responsável <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="gestor_responsavel" id="gestor_responsavel" value={formData.gestor_responsavel} onChange={handleChange} style={errors.gestor_responsavel ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('gestor_responsavel')}</div>
            <div className="form-item"><label htmlFor="apoio_gestao">Apoio da Gestão <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="apoio_gestao" id="apoio_gestao" value={formData.apoio_gestao} onChange={handleChange} style={errors.apoio_gestao ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('apoio_gestao')}</div>
            <div className="form-item"><label htmlFor="centro_custo_veiculo">Centro de Custo Veículo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="centro_custo_veiculo" id="centro_custo_veiculo" value={formData.centro_custo_veiculo} onChange={handleChange} style={errors.centro_custo_veiculo ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('centro_custo_veiculo')}</div>
            <div className="form-item">
              <label htmlFor="finalidade">Finalidade <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
              <select name="finalidade" id="finalidade" value={formData.finalidade} onChange={handleChange} style={errors.finalidade ? { borderColor: 'var(--magnum-red-status)' } : {}}>
                <option value="">Selecione</option>
                {finalidadeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {renderError('finalidade')}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Contrato e Locação</h2>
          <div className="form-grid cols-3">
            <div className="form-item"><label htmlFor="locadora">Locadora <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" name="locadora" id="locadora" value={formData.locadora} onChange={handleChange} style={errors.locadora ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('locadora')}</div>
            <div className="form-item">
              <label htmlFor="valor_mensal">Valor Mensal (R$) <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
              <input type="text" id="valor_mensal" name="valor_mensal" value={valorMensalDisplay} onChange={handleValorMensalChange} placeholder="0,00" style={errors.valor_mensal ? { borderColor: 'var(--magnum-red-status)' } : {}}/>
              {renderError('valor_mensal')}
            </div>
            <div className="form-item"><label htmlFor="periodo_contrato_meses">Período Contrato (Meses)</label><input type="number" name="periodo_contrato_meses" id="periodo_contrato_meses" value={formData.periodo_contrato_meses} onChange={handleChange} /></div>
            <div className="form-item"><label htmlFor="data_disponibilizacao">Data Disponibilização <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="date" name="data_disponibilizacao" id="data_disponibilizacao" value={formData.data_disponibilizacao} onChange={handleChange} style={errors.data_disponibilizacao ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('data_disponibilizacao')}</div>
            <div className="form-item"><label htmlFor="data_prevista_devolucao">Data Devolução Prevista <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="date" name="data_prevista_devolucao" id="data_prevista_devolucao" value={formData.data_prevista_devolucao} onChange={handleChange} style={errors.data_prevista_devolucao ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('data_prevista_devolucao')}</div>
          </div>
        </div>
        
        <div className="form-section">
            <h2 className="section-title">Anexos do Veículo</h2>
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
          <h2 className="section-title">Observação Geral</h2>
          <div className="form-item">
            <textarea name="observacao_geral" id="observacao_geral" value={formData.observacao_geral} onChange={handleChange} rows={5}/>
          </div>
        </div>
      </form>
    </FormPageLayout>
  );
}
