// src/app/perfil/page.tsx
'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// O useRouter já não é necessário para a proteção da rota

// Mapeamento das roles para nomes completos
const roleDisplayNames: { [key: string]: string } = {
  USER: 'Utilizador',
  ADMIN: 'Administrador',
  MODERATOR: 'Moderador',
};

export default function PerfilPage() {
  // O status e o router para proteção já são tratados pelo ClientLayout
  const { data: session, update } = useSession();

  // Estados para os campos do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Estados para UI e feedback
  const [editando, setEditando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/perfil');
      if (!response.ok) throw new Error('Falha ao carregar o perfil.');
      const data = await response.json();
      setNomeCompleto(data.nomeCompleto || '');
      setTelefone(data.telefone || '');
      setCpf(data.cpf || '');
      setCargo(data.cargo || '');
    } catch (err: any) {
      setErro(err.message);
    }
  }, []);

  // Busca os dados do perfil apenas quando a sessão estiver disponível
  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  const salvarPerfil = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nomeCompleto.trim()) {
      setErro('O campo "Nome completo" é obrigatório.');
      return;
    }

    try {
      const response = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto, telefone, cpf, cargo }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Falha ao atualizar o perfil.');
      }
      
      setNomeCompleto(resultado.nomeCompleto);
      setTelefone(resultado.telefone);
      setCpf(resultado.cpf);
      setCargo(resultado.cargo);

      setSucesso('Perfil atualizado com sucesso!');
      setEditando(false);
      await update({ ...session, user: { ...session?.user, name: resultado.nomeCompleto } });
    } catch (err: any) {
      setErro(err.message);
    }
  };

  const formatarTelefone = (valor: string) => {
    return valor.replace(/\D/g,'').replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').replace(/(-\d{4})\d+?$/,'$1');
  };

  const formatarCpf = (valor: string) => {
    return valor.replace(/\D/g,'').slice(0, 11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  };
  
  // A lógica de carregamento e de utilizador não autenticado foi movida para o ClientLayout
  
  const userRole = (session?.user as any)?.role || 'USER';

  return (
      <main className="main-content-area">
        <div className="page-header">
          <h1 className="page-title">Meu Perfil</h1>
          {!editando && (
             <button onClick={() => setEditando(true)} className="btn btn-primary">Editar Perfil</button>
          )}
        </div>

        {erro && <div className="form-feedback-message error">{erro}</div>}
        {sucesso && <div className="form-feedback-message success">{sucesso}</div>}

        <div className="card">
          <form onSubmit={salvarPerfil} className="form-grid cols-2">
            <div className="info-item">
              <label>Email</label>
              <span>{session?.user?.email}</span>
            </div>
             <div className="info-item">
              <label>Função</label>
              <span>{roleDisplayNames[userRole] || userRole}</span>
            </div>

            <div className="form-item">
              <label htmlFor="nomeCompleto">Nome completo</label>
              <input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required disabled={!editando} />
            </div>

            <div className="form-item">
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} disabled={!editando} />
            </div>

            <div className="form-item">
              <label htmlFor="cpf">CPF</label>
              <input type="text" id="cpf" value={cpf} maxLength={14} onChange={(e) => setCpf(formatarCpf(e.target.value))} disabled={!editando} />
            </div>

            <div className="form-item">
              <label htmlFor="cargo">Cargo</label>
              <input type="text" id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} disabled={!editando} />
            </div>

            {editando && (
              <div className="form-actions-container" style={{ gridColumn: '1 / -1' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            )}
          </form>
        </div>
      </main>
  );
}
