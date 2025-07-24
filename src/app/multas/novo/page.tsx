// src/app/multas/nova/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormPageLayout from '@/components/FormPageLayout';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import { supabase } from '@/lib/supabaseClient';

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

const statusIndicacaoOptions = ['Pendente', 'Indicação Realizada', 'Não Houve Indicação'] as const;
const statusPagamentoOptions = ['Aguardando Fatura', 'Aguardando Pagamento', 'Paga', 'Vencida', 'Cancelada'] as const;

interface FormData {
  ait_numero: string;
  data_infracao: string;
  veiculo_id: string;
  condutor_indicado_id: string;
  gravidade_infracao: string;
  status_indicacao: typeof statusIndicacaoOptions[number];
  status_pagamento_multa: typeof statusPagamentoOptions[number];
  data_notificacao_indicacao: string;
  prazo_indicacao_condutor: string;
  observacoes_gerais_multa: string;
  numero_fatura: string;
  data_vencimento_multa: string;
  data_pagamento_multa: string;
}

export default function NovaMultaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    ait_numero: '',
    data_infracao: '',
    veiculo_id: '',
    condutor_indicado_id: '',
    gravidade_infracao: '',
    status_indicacao: 'Pendente',
    status_pagamento_multa: 'Aguardando Fatura',
    data_notificacao_indicacao: '',
    prazo_indicacao_condutor: '',
    observacoes_gerais_multa: '',
    numero_fatura: '',
    data_vencimento_multa: '',
    data_pagamento_multa: '',
  });
  const [veiculos, setVeiculos] = useState<{ id: string; placa: string }[]>([]);
  const [condutores, setCondutores] = useState<{ id: string; nome_completo: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    displayValue: valorMultaDisplay,
    numericValue: valorMultaNumeric,
    handleChange: handleValorMultaChange
  } = useCurrencyInput();

  // Carrega veículos e condutores
  useEffect(() => {
    async function load() {
      try {
        const [vRes, cRes] = await Promise.all([
          supabase.from('veiculos').select('id, placa').order('placa'),
          supabase.from('condutores').select('id, nome_completo').order('nome_completo')
        ]);
        if (vRes.error) throw vRes.error;
        if (cRes.error) throw cRes.error;
        setVeiculos(vRes.data);
        setCondutores(cRes.data);
      } catch {
        setFeedback({ type: 'error', message: 'Não foi possível carregar veículos ou condutores.' });
      }
    }
    load();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleRemoveNewFile = (file: File) => {
    setSelectedFiles(prev => prev.filter(f => f !== file));
  };

  const validateForm = (): Partial<Record<keyof FormData, string>> => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!formData.ait_numero) errs.ait_numero = 'O campo Nº do AIT é obrigatório.';
    if (!formData.veiculo_id) errs.veiculo_id = 'A placa é obrigatória.';
    if (!formData.data_infracao) errs.data_infracao = 'A data da infração é obrigatória.';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    // Upload de anexos
    let uploadedFiles: any[] = [];
    if (selectedFiles.length) {
      setFeedback({ type: 'info', message: `Enviando ${selectedFiles.length} anexo(s)...` });
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append('files', f));
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erro no upload.');
        uploadedFiles = json.files;
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message });
        setIsSubmitting(false);
        return;
      }
    }

    // Monta payload
    const payload = {
      ...formData,
      valor_original_multa: valorMultaNumeric,
      anexos: uploadedFiles
    };
    // converte strings vazias em null
    Object.keys(payload).forEach(k => {
      if (payload[k as keyof typeof payload] === '') {
        payload[k as keyof typeof payload] = null;
      }
    });

    try {
      const res = await fetch('/api/multas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao criar multa.');
      setFeedback({ type: 'success', message: 'Multa registrada com sucesso! Redirecionando...' });
      setTimeout(() => router.push('/multas'), 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageActions = (
    <>
      <Link href="/multas" className="btn btn-secondary">Cancelar</Link>
      <button type="submit" form="add-fine-form" className="btn btn-primary" disabled={isSubmitting}>
        <IconSalvar /> {isSubmitting ? 'Salvando...' : 'Salvar Infração'}
      </button>
    </>
  );

  const renderError = (field: keyof FormData) =>
    errors[field] && <small style={{ color: 'var(--magnum-red-status)', marginTop: 'var(--space-2)' }}>{errors[field]}</small>;

  return (
    <FormPageLayout
      title="Registrar Nova Infração"
      subtitle="Preencha os dados abaixo para registrar uma nova infração."
      backLink="/multas"
      actions={pageActions}
      feedback={feedback}
    >
      <form id="add-fine-form" onSubmit={handleSubmit}>
        {/* Dados da Infração */}
        <div className="form-section">
          <h2 className="section-title">Dados da Infração</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="ait_numero">
                Nº do AIT <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                type="text"
                id="ait_numero"
                name="ait_numero"
                value={formData.ait_numero}
                onChange={handleChange}
                style={errors.ait_numero ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('ait_numero')}
            </div>
            <div className="form-item">
              <label htmlFor="veiculo_id">
                Placa do Veículo <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <select
                id="veiculo_id"
                name="veiculo_id"
                value={formData.veiculo_id}
                onChange={handleChange}
                style={errors.veiculo_id ? { borderColor: 'var(--magnum-red-status)' } : {}}
              >
                <option value="">Selecione</option>
                {veiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.placa}</option>
                ))}
              </select>
              {renderError('veiculo_id')}
            </div>
            <div className="form-item">
              <label htmlFor="data_infracao">
                Data da Infração <span style={{ color: 'var(--magnum-red-status)' }}>*</span>
              </label>
              <input
                type="date"
                id="data_infracao"
                name="data_infracao"
                value={formData.data_infracao}
                onChange={handleChange}
                style={errors.data_infracao ? { borderColor: 'var(--magnum-red-status)' } : {}}
              />
              {renderError('data_infracao')}
            </div>
            <div className="form-item">
              <label htmlFor="gravidade_infracao">Gravidade</label>
              <select id="gravidade_infracao" name="gravidade_infracao" value={formData.gravidade_infracao} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Leve">Leve</option>
                <option value="Média">Média</option>
                <option value="Grave">Grave</option>
                <option value="Gravíssima">Gravíssima</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indicação do Condutor */}
        <div className="form-section">
          <h2 className="section-title">Indicação do Condutor</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="condutor_indicado_id">Condutor Indicado</label>
              <select
                id="condutor_indicado_id"
                name="condutor_indicado_id"
                value={formData.condutor_indicado_id}
                onChange={handleChange}
              >
                <option value="">Nenhum / Empresa</option>
                {condutores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome_completo}</option>
                ))}
              </select>
            </div>
            <div className="form-item">
              <label htmlFor="data_notificacao_indicacao">Data da Notificação</label>
              <input
                type="date"
                id="data_notificacao_indicacao"
                name="data_notificacao_indicacao"
                value={formData.data_notificacao_indicacao}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="prazo_indicacao_condutor">Prazo para Indicação</label>
              <input
                type="date"
                id="prazo_indicacao_condutor"
                name="prazo_indicacao_condutor"
                value={formData.prazo_indicacao_condutor}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="status_indicacao">Status da Indicação</label>
              <select
                id="status_indicacao"
                name="status_indicacao"
                value={formData.status_indicacao}
                onChange={handleChange}
              >
                {statusIndicacaoOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fatura e Pagamento */}
        <div className="form-section">
          <h2 className="section-title">Fatura e Pagamento</h2>
          <div className="form-grid cols-3">
            <div className="form-item">
              <label htmlFor="numero_fatura">Nº da Fatura</label>
              <input
                type="text"
                id="numero_fatura"
                name="numero_fatura"
                value={formData.numero_fatura}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="valor_original_multa">Valor Original (R$)</label>
              <input
                type="text"
                id="valor_original_multa"
                name="valor_original_multa"
                value={valorMultaDisplay}
                onChange={handleValorMultaChange}
                placeholder="0,00"
              />
            </div>
            <div className="form-item">
              <label htmlFor="data_vencimento_multa">Data de Vencimento</label>
              <input
                type="date"
                id="data_vencimento_multa"
                name="data_vencimento_multa"
                value={formData.data_vencimento_multa}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="data_pagamento_multa">Data de Pagamento</label>
              <input
                type="date"
                id="data_pagamento_multa"
                name="data_pagamento_multa"
                value={formData.data_pagamento_multa}
                onChange={handleChange}
              />
            </div>
            <div className="form-item">
              <label htmlFor="status_pagamento_multa">Status do Pagamento</label>
              <select
                id="status_pagamento_multa"
                name="status_pagamento_multa"
                value={formData.status_pagamento_multa}
                onChange={handleChange}
              >
                {statusPagamentoOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Anexos */}
        <div className="form-section">
          <h2 className="section-title">Anexos</h2>
          <div className="form-item">
            <label className="file-input-container">
              <span className="btn btn-secondary">
                <IconAnexo /> {selectedFiles.length ? `${selectedFiles.length} arquivo(s)` : 'Escolher arquivos'}
              </span>
              <input
                type="file"
                multiple
                className="visually-hidden"
                onChange={handleFileChange}
              />
            </label>
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--magnum-text-light)' }}>
                <p>Novos arquivos selecionados:</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {selectedFiles.map((file, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span>- {file.name}</span>
                      <button type="button" onClick={() => handleRemoveNewFile(file)} className="btn-icon" title="Remover seleção">
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
              id="observacoes_gerais_multa"
              name="observacoes_gerais_multa"
              value={formData.observacoes_gerais_multa}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>
      </form>
    </FormPageLayout>
  );
}
