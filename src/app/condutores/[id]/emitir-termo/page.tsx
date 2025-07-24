// src/app/condutores/[id]/emitir-termo/page.js
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IMaskInput } from 'react-imask';
import FormPageLayout from '@/components/FormPageLayout'; // Usando o layout padrão

// Ícones
const IconFilter = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>;
const IconDocument = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/></svg>;
const IconArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>;

// Função de formatação para exibir CPF/CNPJ no formulário do termo
const formatDocumentForDisplay = (doc) => {
  if (!doc || typeof doc !== 'string') return '';
  const digits = doc.replace(/\D/g, ''); 
  if (digits.length === 11) { return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); }
  if (digits.length === 14) { return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); }
  return doc; 
};

export default function PaginaEmitirTermoVeiculo() {
  const params = useParams();
  const router = useRouter();
  const condutorId = params?.id; 

  const [condutorData, setCondutorData] = useState(null);
  const [isLoadingCondutor, setIsLoadingCondutor] = useState(true);
  const [allVehicles, setAllVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState(null);
  const [searchTermPlaca, setSearchTermPlaca] = useState('');
  const [searchTermEmpresa, setSearchTermEmpresa] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedVehicleData, setSelectedVehicleData] = useState(null);
  const [termFormData, setTermFormData] = useState({});
  const [step, setStep] = useState(1); 
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (condutorId) {
      setIsLoadingCondutor(true);
      fetch(`/api/condutores/${condutorId}`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setCondutorData(data))
        .catch(() => setFeedback({type:'error', message: "Falha ao carregar dados do condutor."}))
        .finally(() => setIsLoadingCondutor(false));
    }
  }, [condutorId]);

  useEffect(() => {
    if (step === 1) { 
      setIsLoadingVehicles(true); 
      fetch('/api/veiculos') 
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setAllVehicles(Array.isArray(data) ? data : []))
        .catch(() => setVehicleError("Falha ao buscar veículos."))
        .finally(() => setIsLoadingVehicles(false));
    }
  }, [step]);

  const displayableVehicles = useMemo(() => {
    return allVehicles.filter(veiculo => 
      (veiculo.placa?.toLowerCase().includes(searchTermPlaca.toLowerCase()) ?? true) &&
      (veiculo.empresa_responsavel?.toLowerCase().includes(searchTermEmpresa.toLowerCase()) ?? true)
    );
  }, [allVehicles, searchTermPlaca, searchTermEmpresa]);

  const handleVehicleSelectionAndProceed = async () => {
    if (!selectedVehicleId) {
      setFeedback({type:'error', message: "Por favor, selecione um veículo."});
      return;
    }
    setIsLoadingVehicles(true); 
    try {
      const response = await fetch(`/api/veiculos/${selectedVehicleId}`); 
      if (!response.ok) throw new Error("Falha ao buscar detalhes do veículo.");
      const vehicleData = await response.json();
      setSelectedVehicleData(vehicleData);
      
      setTermFormData({
        nome_condutor: condutorData?.nome_completo || '',
        cnh_numero: condutorData?.cnh_numero || '',
        cnh_categoria: condutorData?.cnh_categoria || '',
        cpf_cnpj_display: formatDocumentForDisplay(condutorData?.cpf || ''),
        modelo_veiculo: vehicleData?.modelo || '',
        marca_veiculo: vehicleData?.marca || '',
        ano_veiculo: vehicleData?.ano_modelo || '', 
        placa_veiculo: vehicleData?.placa || '',
        chassi_veiculo: vehicleData?.chassi || '',
      });
      setStep(2); 
    } catch (error) {
      setFeedback({type:'error', message: `Erro: ${error.message}`});
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleTermFormChange = (e) => {
    const { name, value } = e.target;
    setTermFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMaskedInputChange = (name, value) => { 
    setTermFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEmitirTermo = async () => {
    setIsGeneratingDoc(true);
    setFeedback({type:'', message:''}); 
    
    const nomeArquivo = `Termo_Responsabilidade_${(termFormData.nome_condutor || 'Condutor').replace(/\s+/g, '_')}_${termFormData.placa_veiculo || 'Veiculo'}.docx`;
    const payloadParaApi = { ...termFormData, cpf_cnpj_formatado: termFormData.cpf_cnpj_display };

    try {
        const response = await fetch('/api/termos/gerar-documento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadParaApi),
        });
        if (!response.ok) throw new Error("Falha ao gerar documento no servidor.");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo; 
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setFeedback({type:'success', message: "Documento gerado e download iniciado!"});
      } catch (error) {
        setFeedback({type:'error', message: `Erro: ${error.message}`});
      } finally {
        setIsGeneratingDoc(false);
      }
  };

  if (isLoadingCondutor) {
    return <div className="main-content-area"><div className="card">A carregar...</div></div>;
  }

  return (
    <FormPageLayout
      title="Emitir Termo de Responsabilidade"
      subtitle={<>Condutor: <span style={{color: 'var(--magnum-red)'}}>{condutorData?.nome_completo || 'N/A'}</span></>}
      backLink={condutorId ? `/condutores/${condutorId}` : '/condutores'}
    >
      {feedback.message && <div className={`form-feedback-message ${feedback.type}`}>{feedback.message}</div>}
      
      {step === 1 && (
        // CORRIGIDO: Substituído 'card' por 'form-section'
        <div className="form-section">
          <h2 className="section-title"><IconFilter /> 1. Selecione o Veículo</h2>
          <div className="form-grid cols-2">
              <div className="form-item">
                  <label htmlFor="searchTermPlaca">Filtrar por Placa:</label>
                  <input type="text" id="searchTermPlaca" value={searchTermPlaca} onChange={(e) => setSearchTermPlaca(e.target.value.toUpperCase())} placeholder="Digite a placa..."/>
              </div>
              <div className="form-item">
                  <label htmlFor="searchTermEmpresa">Filtrar por Empresa:</label>
                  <input type="text" id="searchTermEmpresa" value={searchTermEmpresa} onChange={(e) => setSearchTermEmpresa(e.target.value)} placeholder="Digite nome da empresa..."/>
              </div>
          </div>
          <div className="form-item" style={{marginTop: 'var(--space-4)'}}>
            <label htmlFor="selectedVehicleId">Veículo <span style={{color: 'var(--magnum-red-status)'}}>*</span></label>
            {isLoadingVehicles && <p>A carregar veículos...</p>}
            {vehicleError && <p style={{color: 'red'}}>{vehicleError}</p>}
            {!isLoadingVehicles && !vehicleError && (
              <select id="selectedVehicleId" name="selectedVehicleId" value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} required>
                <option value="">-- Selecione um Veículo --</option>
                {displayableVehicles.length > 0 ? (
                  displayableVehicles.map(veiculo => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.modelo} {veiculo.empresa_responsavel ? `(${veiculo.empresa_responsavel})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum veículo encontrado.</option>
                )}
              </select>
            )}
          </div>
          <div className="form-actions-container">
            <button onClick={handleVehicleSelectionAndProceed} className="btn btn-primary" disabled={!selectedVehicleId || isLoadingVehicles}>
              Prosseguir <IconArrowRight />
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedVehicleData && condutorData && (
        // CORRIGIDO: Substituído 'card' por 'form-section'
        <div className="form-section">
            <h2 className="section-title">2. Confirme os Dados do Termo</h2>
            <p style={{fontSize: '0.9em', color: 'var(--magnum-text-light)', marginBottom: '1.5rem'}}>
                Os campos abaixo foram pré-preenchidos. Revise e edite se necessário.
            </p>
            <div className="form-grid cols-2"> 
                <div className="form-item"><label htmlFor="nome_condutor">Nome do Condutor:</label><input type="text" name="nome_condutor" id="nome_condutor" value={termFormData.nome_condutor || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="cpf_cnpj_display">CPF / CNPJ do Condutor:</label><IMaskInput mask={[{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }]} value={termFormData.cpf_cnpj_display || ''} onAccept={(value) => handleMaskedInputChange('cpf_cnpj_display', value)} name="cpf_cnpj_display" id="cpf_cnpj_display" type="text" placeholder="CPF ou CNPJ"/></div>
                <div className="form-item"><label htmlFor="cnh_numero">Nº CNH:</label><input type="text" name="cnh_numero" id="cnh_numero" value={termFormData.cnh_numero || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="cnh_categoria">Categoria CNH:</label><input type="text" name="cnh_categoria" id="cnh_categoria" value={termFormData.cnh_categoria || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="placa_veiculo">Placa do Veículo:</label><input type="text" name="placa_veiculo" id="placa_veiculo" value={termFormData.placa_veiculo || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="marca_veiculo">Marca do Veículo:</label><input type="text" name="marca_veiculo" id="marca_veiculo" value={termFormData.marca_veiculo || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="modelo_veiculo">Modelo do Veículo:</label><input type="text" name="modelo_veiculo" id="modelo_veiculo" value={termFormData.modelo_veiculo || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="ano_veiculo">Ano do Veículo (Modelo):</label><input type="text" name="ano_veiculo" id="ano_veiculo" value={termFormData.ano_veiculo || ''} onChange={handleTermFormChange} /></div>
                <div className="form-item"><label htmlFor="chassi_veiculo">Chassi do Veículo:</label><input type="text" name="chassi_veiculo" id="chassi_veiculo" value={termFormData.chassi_veiculo || ''} onChange={handleTermFormChange} /></div>
            </div>
            <div className="form-actions-container" style={{ justifyContent: 'space-between' }}>
                <button onClick={() => { setStep(1); setSelectedVehicleData(null); }} className="btn btn-secondary">
                    Voltar para Seleção
                </button>
                <button onClick={handleEmitirTermo} className="btn btn-primary" disabled={isGeneratingDoc}>
                  {isGeneratingDoc ? 'A gerar...' : <><IconDocument /> Gerar Documento</>}
                </button>
            </div>
        </div>
      )}
    </FormPageLayout>
  );
}
