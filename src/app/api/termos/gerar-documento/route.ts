import { NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// Função de formatação (pode não ser mais necessária aqui se o frontend envia sempre formatado)
const formatDocumentForTemplate = (doc) => {
  if (!doc || typeof doc !== 'string') return '____________________';
  const digits = doc.replace(/\D/g, '');
  if (digits.length === 11) { // CPF
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) { // CNPJ
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  if (doc.includes('.') || doc.includes('-') || doc.includes('/')) return doc;
  return doc.trim() !== '' ? doc : '____________________'; 
};

export async function POST(request) {
  console.log("API /api/termos/gerar-documento: Rota acessada.");
  try {
    const termData = await request.json();
    // termData AGORA DEVE CONTER a chave 'cpf_cnpj_formatado' diretamente do frontend
    console.log("API: Dados recebidos do frontend:", termData);

    const templatePath = path.resolve('./templates', 'template_termo_responsabilidade.docx');
    console.log("API: Caminho absoluto do template:", templatePath);

    if (!fs.existsSync(templatePath)) {
        console.error(`API ERRO: Template não encontrado em: ${templatePath}`);
        // ... (logs de depuração de diretório) ...
        return NextResponse.json({ message: 'Erro crítico: Ficheiro template do termo não encontrado no servidor.' }, { status: 500 });
    }
    console.log("API: Template encontrado.");

    const content = fs.readFileSync(templatePath, 'binary');
    console.log("API: Conteúdo do template lido.");

    const zip = new PizZip(content);
    console.log("API: PizZip carregado.");
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function(part) { 
        console.warn(`Docxtemplater: Tag {${part.value}} não encontrada nos dados ou valor nulo. Usando string vazia.`);
        return ""; 
      }
    });
    console.log("API: Docxtemplater instanciado.");

    // Preparar dados para o template
    // A chave 'cpf_cnpj_formatado' no dataForTemplate deve corresponder ao placeholder no seu .docx
    const dataForTemplate = {
      nome_condutor: termData.nome_condutor || '',
      cnh_numero: termData.cnh_numero || '',
      cnh_categoria: termData.cnh_categoria || '',
      // USA DIRETAMENTE O CAMPO ENVIADO PELO FRONTEND
      cpf_cnpj_formatado: termData.cpf_cnpj_formatado || '____________________', 
      modelo_veiculo: termData.modelo_veiculo || '',
      marca_veiculo: termData.marca_veiculo || '',
      ano_veiculo: termData.ano_veiculo || '', 
      placa_veiculo: termData.placa_veiculo || '',
      chassi_veiculo: termData.chassi_veiculo || '',
      // Adicione quaisquer outros campos que o seu template .docx espera
    };
    console.log("API: Dados FINAIS a serem renderizados no template:", dataForTemplate);

    // Aviso do Docxtemplater sobre .setData() ser depreciado.
    // Para versões mais recentes, o ideal seria usar .loadZip(zip).setData(dataForTemplate).render()
    // ou doc.resolveData(dataForTemplate).then(function() { doc.render() });
    // Mas .setData() ainda funciona e é mais simples para este caso.
    // Se quiser atualizar para a API mais recente do docxtemplater:
    // doc.loadZip(zip); // Já foi feito no construtor
    // doc.compile(); // Compila o template (opcional, mas pode melhorar performance para múltiplos renders)
    // doc.resolveData(dataForTemplate).then(function() {
    //    doc.render();
    //    // ... o resto da lógica de gerar buffer ...
    // }).catch(function (error) {
    //    // ... tratamento de erro de resolveData ...
    // });
    // Por agora, manteremos .setData() que é mais simples e funciona.
    doc.setData(dataForTemplate);
    console.log("API: Dados setados no Docxtemplater.");
    
    doc.render();
    console.log("API: Template renderizado com sucesso.");

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    console.log("API: Buffer do ficheiro .docx gerado.");
    
    const nomeArquivo = `Termo_Responsabilidade_${(dataForTemplate.nome_condutor || 'Condutor').replace(/\s+/g, '_')}_${(dataForTemplate.placa_veiculo || 'VEICULO')}.docx`;
    console.log(`API: Preparando para enviar o ficheiro: ${nomeArquivo}`);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    });

  } catch (error) { 
    console.error('API ERRO GERAL em /api/termos/gerar-documento:', error);
    if (error.properties && error.properties.errors) {
        console.error("Detalhes do erro Docxtemplater:", JSON.stringify(error.properties.errors, null, 2));
        const firstError = error.properties.errors[0];
        return NextResponse.json({ 
            message: `Erro ao processar o documento: ${firstError.message}. (Tag: ${firstError.properties?.id || 'desconhecida'})`, 
            details: JSON.stringify(error.properties.errors) 
        }, { status: 500 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor ao gerar o documento.', details: error.message, errorStack: error.stack }, { status: 500 });
  }
}
