import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// Função para UPLOAD de um ou mais arquivos
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const fileName = `${uuidv4()}-${file.name}`;
      const { error } = await supabaseAdmin.storage.from('anexos').upload(fileName, file);
      if (error) throw new Error(`Falha no upload do arquivo: ${file.name}`);
      
      const { data: urlData } = supabaseAdmin.storage.from('anexos').getPublicUrl(fileName);
      return {
        url: urlData.publicUrl,
        fileName: file.name,
        filePath: fileName,
        uploaded_at: new Date().toISOString(),
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    return NextResponse.json({ message: 'Upload bem-sucedido!', files: uploadedFiles }, { status: 200 });

  } catch (error) {
    console.error('Erro na API de Upload (POST):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Função para EXCLUIR um arquivo
export async function DELETE(request) {
    try {
        const { filePath } = await request.json();

        if (!filePath) {
            return NextResponse.json({ error: 'Caminho do arquivo não fornecido.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .storage
            .from('anexos')
            .remove([filePath]);

        if (error) {
            console.error('Erro ao remover arquivo do Supabase Storage:', error);
            throw new Error('Falha ao remover o anexo.');
        }

        return NextResponse.json({ message: 'Anexo removido com sucesso!' });

    } catch (error) {
        console.error('Erro na API de Upload (DELETE):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
