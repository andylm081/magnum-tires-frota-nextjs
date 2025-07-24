// src/app/perfil/page.js
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ConfirmationModal from '../components/ConfirmationModal';

export default function PerfilPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  const [isModalSenhaOpen, setIsModalSenhaOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [editando, setEditando] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const usuario = session?.user;
      setUser(usuario);
      setNomeCompleto(usuario?.user_metadata?.nome_completo || '');
      setTelefone(usuario?.user_metadata?.telefone || '');
      setCpf(usuario?.user_metadata?.cpf || '');
      setCargo(usuario?.user_metadata?.cargo || '');
    };
    carregarPerfil();
  }, [supabase]);

  const salvarPerfil = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!nomeCompleto.trim()) {
      setErro('O campo "Nome completo" é obrigatório.');
      return;
    }

    // 1. Atualiza o user_metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { nome_completo: nomeCompleto, telefone, cpf, cargo },
    });

    if (authError) {
      setErro('Erro ao atualizar metadados: ' + authError.message);
      return;
    }

    // 2. Chama a rota API para salvar na tabela
    const response = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_completo: nomeCompleto, telefone, cpf, cargo }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      setErro('Erro ao salvar no banco: ' + resultado.error);
    } else {
      setSucesso('Perfil atualizado com sucesso!');
      setEditando(false);
    }
  };

  const alterarSenha = async () => {
    setErro(null);
    setSucesso(null);

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      setErro('Erro ao alterar senha: ' + error.message);
    } else {
      setSucesso('Senha alterada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
      setIsModalSenhaOpen(false);
    }
  };

  const enviarAlteracaoEmail = async () => {
    setErro(null);
    setSucesso(null);

    const { error } = await supabase.auth.updateUser({ email: novoEmail });
    if (error) {
      setErro('Erro ao solicitar alteração de email: ' + error.message);
    } else {
      setSucesso('Verifique seu novo email para confirmar a alteração.');
      setEditandoEmail(false);
      setNovoEmail('');
    }
  };

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatarCpf = (valor) => {
    return valor
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  if (!user) return <p>Carregando perfil...</p>;

  return (
    <div className="card">
      <h1 className="page-title" style={{ marginBottom: 'var(--space-5)' }}>Meu Perfil</h1>

      <div style={{ marginBottom: 'var(--space-5)' }}>
        {erro && <div className="form-feedback-message error">{erro}</div>}
        {sucesso && <div className="form-feedback-message success">{sucesso}</div>}
      </div>

      {!editando && (
        <div className="form-actions-container" style={{ marginBottom: 'var(--space-5)' }}>
          <button onClick={() => setEditando(true)} className="btn btn-primary">Editar Perfil</button>
        </div>
      )}

      <form onSubmit={salvarPerfil} className="form-grid cols-2">
        <div className="form-item">
          <label htmlFor="nome">Nome completo</label>
          <input
            type="text"
            id="nome"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
            disabled={!editando}
          />
        </div>

        <div className="form-item">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={user.email} readOnly disabled />
          {!editandoEmail && editando ? (
            <div>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={() => setEditandoEmail(true)}
                style={{ marginTop: '0.5rem' }}
              >
                Alterar Email
              </button>
            </div>
          ) : editandoEmail ? (
            <div className="form-item" style={{ marginTop: '1rem' }}>
              <label>Novo Email</label>
              <input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
                onClick={enviarAlteracaoEmail}
              >
                Enviar Confirmação
              </button>
            </div>
          ) : null}
        </div>

        <div className="form-item">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="tel"
            id="telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            disabled={!editando}
          />
        </div>

        <div className="form-item">
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            maxLength={14}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            disabled={!editando}
          />
        </div>

        <div className="form-item">
          <label htmlFor="cargo">Cargo</label>
          <input
            type="text"
            id="cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            disabled={!editando}
          />
        </div>

        {editando && (
          <div className="form-actions-container" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            <button type="button" className="btn btn-outline-danger" onClick={() => setIsModalSenhaOpen(true)}>Alterar Senha</button>
          </div>
        )}
      </form>

      <ConfirmationModal
        isOpen={isModalSenhaOpen}
        onClose={() => setIsModalSenhaOpen(false)}
        onConfirm={alterarSenha}
        title="Alterar Senha"
        message={(
          <>
            <div className="form-item">
              <label>Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>
            <div className="form-item">
              <label>Confirmar nova senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>
          </>
        )}
        confirmButtonText="Salvar Senha"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
}
