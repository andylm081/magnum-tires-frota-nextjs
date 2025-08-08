// src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// --- Ícones para os campos do formulário ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Novo estado para o carregamento
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Ativa o estado de carregamento

    try {
      // A função signIn agora é a única responsável pela validação
      const result = await signIn('credentials', {
        redirect: false, // Importante para mantermos o controlo
        email,
        password,
      });

      if (result?.error) {
        // O erro agora vem diretamente do NextAuth (ex: "Senha incorreta")
        setError('E-mail ou senha incorretos. Por favor, tente novamente.');
        setIsLoading(false); // Desativa o carregamento em caso de erro
      } else {
        // Se o login for bem-sucedido, redireciona para o dashboard
        router.push('/');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null; // Evita erro de hidratação
  }

  return (
    <>
      <style>{`
        .input-field:focus {
          border-color: var(--magnum-red, #D9252D) !important;
          box-shadow: 0 0 0 3px rgba(217, 37, 45, 0.3) !important;
        }
        .btn-login {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(217, 37, 45, 0.4);
        }
      `}</style>
      
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          overflow: 'hidden',
          backgroundImage: 'url(/img/fundo_login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(10, 10, 10, 0.4)',
          backdropFilter: 'blur(5px)'
        }} />

        <div 
          style={{
            position: 'relative',
            maxWidth: '420px',
            width: '100%',
            padding: '3rem 2.5rem',
            borderRadius: 'var(--magnum-border-radius-lg, 10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            color: 'var(--magnum-text-dark, #333333)',
            zIndex: 2,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image
              src="/img/magnum-tires-logo.png"
              alt="Magnum Tires"
              width={180}
              height={50}
              priority
            />
          </div>
          
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Acesso à Plataforma
          </h1>
          <p style={{ color: 'var(--magnum-text-light, #666666)', marginBottom: '2.5rem', textAlign: 'center', fontSize: '0.9rem'}}>
            Bem-vindo! Insira as suas credenciais para aceder.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--magnum-medium-gray, #999999)' }}>
                <UserIcon />
              </span>
              <input
                type="email"
                className="input-field"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 3rem',
                  backgroundColor: 'var(--magnum-light-gray, #f0f2f5)', 
                  color: 'var(--magnum-text-dark, #333333)', 
                  border: '1px solid var(--magnum-border-light, #e0e0e0)',
                  borderRadius: 'var(--magnum-border-radius, 6px)',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--magnum-medium-gray, #999999)' }}>
                <LockIcon />
              </span>
              <input
                type="password"
                className="input-field"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 3rem',
                  backgroundColor: 'var(--magnum-light-gray, #f0f2f5)', 
                  color: 'var(--magnum-text-dark, #333333)', 
                  border: '1px solid var(--magnum-border-light, #e0e0e0)',
                  borderRadius: 'var(--magnum-border-radius, 6px)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: 'var(--magnum-text-light, #666666)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                Lembrar-me
              </label>
              <a href="#" style={{ color: 'var(--magnum-red, #D9252D)', textDecoration: 'none' }}>Esqueceu a senha?</a>
            </div>

            {error && <p className="form-feedback-message error" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-login" disabled={isLoading} style={{ width: '100%', padding: '0.9rem'}}>
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}