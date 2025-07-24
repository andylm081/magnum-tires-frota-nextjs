'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CadastroPerfilPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ nome: '', telefone: '', cpf: '', cargo: '' });
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      let currentUser = user;

      if (error || !currentUser) {
        const emailLocal = localStorage.getItem('cadastro_email');
        const senhaLocal = localStorage.getItem('cadastro_senha');
        if (emailLocal && senhaLocal) {
          const { error: loginError } = await supabase.auth.signInWithPassword({ email: emailLocal, password: senhaLocal });
          if (!loginError) {
            const { data: { user: reloaded } } = await supabase.auth.getUser();
            currentUser = reloaded;
          }
        }
      }

      if (currentUser) {
        setEmail(currentUser.email);
        setUserId(currentUser.id);
      } else {
        setFeedback('Usuário não autenticado. Faça login antes de completar o perfil.');
      }
    })();
  }, [supabase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback('');

    if (!userId) {
      setFeedback('Usuário não identificado.');
      setIsSubmitting(false);
      return;
    }

    const profile = {
      id: userId,
      email,
      nome_completo: form.nome,
      telefone: form.telefone,
      cpf: form.cpf,
      cargo: form.cargo,
    };

    const { error } = await supabase
      .from('usuarios_perfil')
      .upsert([profile], { onConflict: 'id' });

    if (error) {
      console.error('Erro ao salvar perfil:', error.code, error.message);
      setFeedback('Não foi possível salvar o perfil.');
      setIsSubmitting(false);
      return;
    }

    if (token) {
      await supabase.from('convites').delete().eq('token', token);
    }

    router.push('/');
  };

  return (
    <div className="main-content-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', marginTop: '3rem' }}>
        <h1 className="page-title">Dados do Perfil</h1>
        {feedback && <div className="form-feedback-message error">{feedback}</div>}
        <form onSubmit={handleSubmit} className="form-grid cols-1">
          <div className="form-item">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-item">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              value={form.telefone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-item">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              value={form.cpf}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-item">
            <label htmlFor="cargo">Cargo</label>
            <input
              id="cargo"
              name="cargo"
              type="text"
              value={form.cargo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-item">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
