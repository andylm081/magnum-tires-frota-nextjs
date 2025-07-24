'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CadastroPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function buscarConvite() {
      if (!token) return;
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setFeedback('Token inválido ou expirado.');
      } else {
        setInvite(data);
        setEmail(data.email);
      }
    }
    buscarConvite();
  }, [supabase, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setIsSubmitting(true);

    if (!email || !senha || senha !== confirmarSenha) {
      setFeedback('Preencha todos os campos corretamente.');
      setIsSubmitting(false);
      return;
    }
    if (!invite?.role) {
      setFeedback('Convite inválido ou função não definida.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Criar novo usuário no Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        { email, password: senha },
        { data: { user_role: invite.role } }
      );

      if (signUpError && !signUpError.message.toLowerCase().includes('claims')) {
        setFeedback(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      // Se não foi logado automaticamente, faz login manual
      let user = signUpData?.user;
      if (!user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(
          { email, password: senha }
        );
        if (signInError) {
          setFeedback(signInError.message);
          setIsSubmitting(false);
          return;
        }
        user = signInData?.user;
      }

      // Armazena credenciais para perfil
      localStorage.setItem('cadastro_email', email);
      localStorage.setItem('cadastro_senha', senha);

      // Redireciona para completar perfil
      router.push(`/cadastro/perfil?token=${token}`);
    } catch (err) {
      console.error('Erro inesperado no cadastro:', err);
      setFeedback('Erro inesperado ao criar a conta.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', marginTop: '3rem' }}>
        <h1 className="page-title">Criar Conta</h1>
        {feedback && <div className="form-feedback-message error">{feedback}</div>}
        <form onSubmit={handleSubmit} className="form-grid cols-1">
          <div className="form-item">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-item">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-item">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-item">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Criando Conta...' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
