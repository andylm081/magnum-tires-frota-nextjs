// src/app/signup/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IMaskInput } from 'react-imask';

// Objeto para mapear as roles para os nomes a serem exibidos
const roleDisplayNames: { [key: string]: string } = {
  USER: 'Utilizador',
  ADMIN: 'Administrador',
  MODERATOR: 'Moderador',
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');

  // Estados de UI
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado.');
      setIsLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Convite inválido.');
        }
        setEmail(data.email);
        setRole(data.role);
        setIsValidToken(true);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nomeCompleto, telefone, cpf, cargo, token }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar a conta.');
      }

      const loginResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.error) {
        router.push('/login');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p style={{ color: 'var(--magnum-text-dark)', textAlign: 'center' }}>Validando convite...</p>;
    }

    if (error) {
      return <p className="form-feedback-message error">{error}</p>;
    }
    
    if (isValidToken) {
      return (
        <form onSubmit={handleSubmit}>
          <div className="info-item"><label>E-mail (do convite)</label><span>{email}</span></div>
          <div className="info-item"><label>Função</label><span>{roleDisplayNames[role] || role}</span></div>
          <div className="form-item"><label htmlFor="nomeCompleto">Nome Completo</label><input id="nomeCompleto" type="text" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} required /></div>
          <div className="form-item"><label htmlFor="password">Senha</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          
          <div className="form-item">
            <label htmlFor="telefone">Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              id="telefone"
              value={telefone}
              onAccept={(value: any) => setTelefone(value)}
              placeholder="(99) 99999-9999"
            />
          </div>

          <div className="form-item">
            <label htmlFor="cpf">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              id="cpf"
              value={cpf}
              onAccept={(value: any) => setCpf(value)}
              placeholder="999.999.999-99"
            />
          </div>

          <div className="form-item"><label htmlFor="cargo">Cargo</label><input id="cargo" type="text" value={cargo} onChange={e => setCargo(e.target.value)} /></div>
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1.5rem' }}>
            {isLoading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>
      );
    }
    
    return null;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--magnum-light-gray, #f0f2f5)' }}>
      <div style={{ position: 'relative', maxWidth: '500px', width: '100%', padding: '3rem 2.5rem', borderRadius: '10px', backgroundColor: 'var(--magnum-white, #FFFFFF)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: '#333333', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/img/magnum-tires-logo.png" alt="Magnum Tires" width={180} height={50} priority />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem' }}>Criar a sua Conta</h1>
        {renderContent()}
      </div>
    </div>
  );
}

// O Suspense é necessário para que o `useSearchParams` funcione corretamente
export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>A carregar...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
