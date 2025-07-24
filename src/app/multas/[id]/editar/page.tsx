// ARQUIVO: src/app/multas/[id]/editar/page.js (Página de Editar Multa)
// ==================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import { supabase } from '@/lib/supabaseClient';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import ConfirmationModal from '@/components/ConfirmationModal';

// Ícones
const IconSalvar = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>;
const IconAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5S13.5 3.62 13.5 5v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 2.76 2.24 5 5 5s5-2.24 5-5V6h-1.5z"/></svg>;
const IconRemoverAnexo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>;

const formatDateForInput = (dateString) => { if (!dateString) return ''; try { const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); if (isNaN(date.getTime())) return ''; return date.toISOString().split('T')[0]; } catch (e) { return ''; } };

const statusIndicacaoOptions = ['Pendente', 'Indicação Realizada', 'Não Houve Indicação'];
const statusPagamentoOptions = ['Aguardando Fatura', 'Aguardando Pagamento', 'Paga', 'Vencida', 'Cancelada'];

export default function PaginaEditarMulta() {
    const router = useRouter();
    const params = useParams();
    const multaId = params?.id;

    const [formData, setFormData] = useState(null);
    const [veiculos, setVeiculos] = useState([]);
    const [condutores, setCondutores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isAnexoConfirmModalOpen, setIsAnexoConfirmModalOpen] = useState(false);
    const [anexoToDelete, setAnexoToDelete] = useState(null);

    const { 
        displayValue: valorMultaDisplay, 
        numericValue: valorMultaNumeric, 
        handleChange: handleValorMultaChange,
        setValue: setCurrencyValue 
    } = useCurrencyInput();

    const fetchInitialData = useCallback(async () => {
        if (!multaId) {
            setFeedback({type: 'error', message: 'ID da multa não fornecido.'});
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const multaPromise = supabase.from('multas').select(`*`).eq('id', multaId).single();
            const veiculosPromise = supabase.from('veiculos').select('id, placa').order('placa');
            const condutoresPromise = supabase.from('condutores').select('id, nome_completo').order('nome_completo');

            const [multaResult, veiculosResult, condutoresResult] = await Promise.all([multaPromise, veiculosPromise, condutoresPromise]);

            if (multaResult.error) throw new Error('Falha ao buscar dados da multa.');
            if (veiculosResult.error) throw new Error('Falha ao buscar veículos.');
            if (condutoresResult.error) throw new Error('Falha ao buscar condutores.');

            const prefilledData = { ...multaResult.data };
            Object.keys(prefilledData).forEach(key => {
                if (key.startsWith('data_')) {
                    prefilledData[key] = formatDateForInput(prefilledData[key]);
                } else if (prefilledData[key] === null) {
                    prefilledData[key] = '';
                }
            });
            prefilledData.anexos = Array.isArray(prefilledData.anexos) ? prefilledData.anexos : [];
            setFormData(prefilledData);
            setCurrencyValue(prefilledData.valor_original_multa);
            setVeiculos(veiculosResult.data);
            setCondutores(condutoresResult.data);

        } catch (e) {
            setFeedback({type: 'error', message: e.message});
        } finally {
            setIsLoading(false);
        }
    }, [multaId, setCurrencyValue]);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleOpenRemoveAnexoModal = (filePath, fileName) => {
        setAnexoToDelete({ filePath, fileName });
        setIsAnexoConfirmModalOpen(true);
    };

    const executeDeleteAnexo = async () => {
        if (!anexoToDelete) return;
        setFeedback({ type: 'info', message: 'A remover anexo...' });
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: anexoToDelete.filePath }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Falha ao remover anexo.');
            
            const updatedAnexos = formData.anexos.filter(anexo => anexo.filePath !== anexoToDelete.filePath);
            setFormData(prev => ({ ...prev, anexos: updatedAnexos }));
            setFeedback({ type: 'success', message: 'Anexo removido!' });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsAnexoConfirmModalOpen(false);
            setAnexoToDelete(null);
        }
    };

    const handleRemoveNewFile = (fileToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ait_numero) newErrors.ait_numero = "O campo Nº do AIT é obrigatório.";
        if (!formData.veiculo_id) newErrors.veiculo_id = "O campo Placa do Veículo é obrigatório.";
        if (!formData.data_infracao) newErrors.data_infracao = "O campo Data da Infração é obrigatório.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
          setErrors(formErrors);
          return;
        }

        setIsSubmitting(true);
        
        let anexosAtualizados = [...formData.anexos];

        if (selectedFiles.length > 0) {
            setFeedback({ type: 'info', message: `A enviar ${selectedFiles.length} anexo(s)...` });
            const fileFormData = new FormData();
            selectedFiles.forEach(file => { fileFormData.append('files', file); });

            try {
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: fileFormData });
                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok) throw new Error(uploadResult.error || 'Falha no upload dos anexos.');
                anexosAtualizados = [...anexosAtualizados, ...uploadResult.files];
            } catch (uploadError) {
                setFeedback({ type: 'error', message: uploadError.message });
                setIsSubmitting(false);
                return;
            }
        }

        const payload = { ...formData, valor_original_multa: valorMultaNumeric, anexos: anexosAtualizados };
        
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') payload[key] = null;
        });

        try {
            const response = await fetch(`/api/multas/${multaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Falha ao atualizar a multa.');
            
            setFeedback({ type: 'success', message: 'Multa atualizada com sucesso! Redirecionando...' });
            setTimeout(() => router.push(`/multas/${multaId}`), 2000);
        } catch (error) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="main-content-area">
                <div className="card">Carregando dados da multa...</div>
            </div>
        );
    }

    const pageActions = (
        <>
            <Link href={`/multas/${multaId}`} className="btn btn-secondary">Cancelar</Link>
            <button type="submit" form="edit-fine-form" className="btn btn-primary" disabled={isSubmitting}>
                <IconSalvar />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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
            title="Editar Multa"
            subtitle={<>Altere os dados da multa AIT <span style={{color: 'var(--magnum-red)', fontWeight: '500'}}>{formData.ait_numero}</span></>}
            backLink={`/multas/${multaId}`}
            actions={pageActions}
            feedback={feedback}
        >
            <form id="edit-fine-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2 className="section-title">Dados da Infração</h2>
                    <div className="form-grid cols-3">
                        <div className="form-item"><label htmlFor="ait_numero">Nº do AIT <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="text" id="ait_numero" name="ait_numero" value={formData.ait_numero} onChange={handleChange} style={errors.ait_numero ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('ait_numero')}</div>
                        <div className="form-item"><label htmlFor="veiculo_id">Placa do Veículo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><select id="veiculo_id" name="veiculo_id" value={formData.veiculo_id} onChange={handleChange} style={errors.veiculo_id ? { borderColor: 'var(--magnum-red-status)' } : {}}><option value="">Selecione</option>{veiculos.map(v => <option key={v.id} value={v.id}>{v.placa}</option>)}</select>{renderError('veiculo_id')}</div>
                        <div className="form-item"><label htmlFor="data_infracao">Data da Infração <span style={{color: 'var(--magnum-red-status)'}}>*</span></label><input type="date" id="data_infracao" name="data_infracao" value={formData.data_infracao} onChange={handleChange} style={errors.data_infracao ? { borderColor: 'var(--magnum-red-status)' } : {}}/>{renderError('data_infracao')}</div>
                        <div className="form-item"><label htmlFor="gravidade_infracao">Gravidade</label><select id="gravidade_infracao" name="gravidade_infracao" value={formData.gravidade_infracao} onChange={handleChange}><option value="">Selecione</option><option value="Leve">Leve</option><option value="Média">Média</option><option value="Grave">Grave</option><option value="Gravíssima">Gravíssima</option></select></div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Indicação do Condutor</h2>
                    <div className="form-grid cols-3">
                        <div className="form-item"><label htmlFor="condutor_indicado_id">Condutor Indicado</label><select id="condutor_indicado_id" name="condutor_indicado_id" value={formData.condutor_indicado_id} onChange={handleChange}><option value="">Nenhum / Empresa</option>{condutores.map(c => <option key={c.id} value={c.id}>{c.nome_completo}</option>)}</select></div>
                        <div className="form-item"><label htmlFor="data_notificacao_indicacao">Data da Notificação</label><input type="date" id="data_notificacao_indicacao" name="data_notificacao_indicacao" value={formData.data_notificacao_indicacao} onChange={handleChange} /></div>
                        <div className="form-item"><label htmlFor="prazo_indicacao_condutor">Prazo para Indicação</label><input type="date" id="prazo_indicacao_condutor" name="prazo_indicacao_condutor" value={formData.prazo_indicacao_condutor} onChange={handleChange} /></div>
                        <div className="form-item"><label htmlFor="status_indicacao">Status da Indicação</label><select id="status_indicacao" name="status_indicacao" value={formData.status_indicacao} onChange={handleChange}>{statusIndicacaoOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Fatura e Pagamento</h2>
                    <div className="form-grid cols-3">
                        <div className="form-item"><label htmlFor="numero_fatura">Nº da Fatura</label><input type="text" id="numero_fatura" name="numero_fatura" value={formData.numero_fatura} onChange={handleChange} /></div>
                        <div className="form-item">
                            <label htmlFor="valor_original_multa">Valor Original (R$)</label>
                            <input type="text" id="valor_original_multa" name="valor_original_multa" value={valorMultaDisplay} onChange={handleValorMultaChange} placeholder="0,00" />
                        </div>
                        <div className="form-item"><label htmlFor="data_vencimento_multa">Data de Vencimento</label><input type="date" id="data_vencimento_multa" name="data_vencimento_multa" value={formData.data_vencimento_multa} onChange={handleChange} /></div>
                        <div className="form-item"><label htmlFor="data_pagamento_multa">Data de Pagamento</label><input type="date" id="data_pagamento_multa" name="data_pagamento_multa" value={formData.data_pagamento_multa} onChange={handleChange} /></div>
                        <div className="form-item"><label htmlFor="status_pagamento_multa">Status do Pagamento</label><select id="status_pagamento_multa" name="status_pagamento_multa" value={formData.status_pagamento_multa} onChange={handleChange}>{statusPagamentoOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Anexos</h2>
                    {formData.anexos && formData.anexos.length > 0 && (
                        <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 'var(--space-4)' }}>
                            {formData.anexos.map((anexo, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
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
                        <label className="file-input-container"><span className="btn btn-secondary"><IconAnexo /> {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s)` : 'Escolher arquivos'}</span>
                        <input type="file" multiple className="visually-hidden" onChange={handleFileChange} />
                        </label>
                        {selectedFiles.length > 0 && (
                        <div style={{marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--magnum-text-light)'}}>
                            <p>Novos arquivos selecionados:</p>
                            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {selectedFiles.map((file, index) => (
                                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
                                        <span>- {file.name}</span>
                                        <button type="button" onClick={() => handleRemoveNewFile(file)} className="btn-icon" title="Remover seleção"><IconRemoverAnexo /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}
                    </div>
                </div>
                
                <div className="form-section">
                    <h2 className="section-title">Observações</h2>
                    <div className="form-item"><textarea id="observacoes_gerais_multa" name="observacoes_gerais_multa" value={formData.observacoes_gerais_multa} onChange={handleChange} rows="4"></textarea></div>
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
