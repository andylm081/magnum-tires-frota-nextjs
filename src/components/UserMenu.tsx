// src/components/UserMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

// Ícone de Perfil
const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return null;
  }

  if (!session) {
    return (
      <Link href="/login" className="btn btn-primary">
        Login
      </Link>
    );
  }

  return (
    <div className="user-menu-container" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="user-menu-button"
      >
        <div className="user-icon" style={{ color: 'var(--magnum-red)' }}>
            <IconProfile />
        </div>
        {/* Mostra o nome do utilizador, ou o e-mail como fallback */}
        <span>{session.user?.name || session.user?.email}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="m6 9 6 6 6-9" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <span className="user-name">{session.user?.name || 'Utilizador'}</span>
                <span className="user-email">{session.user?.email}</span>
            </div>
            {/* O traço extra foi removido daqui */}
            <Link href="/perfil" className="block px-4 py-2 hover:bg-gray-100">
              Meu Perfil
            </Link>
            
            {session.user?.role === 'ADMIN' && (
              <Link href="/admin/usuarios" className="block px-4 py-2 hover:bg-gray-100">
                Administrar usuários
              </Link>
            )}

            <div className="dropdown-divider"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Sair
            </button>
        </div>
      )}
    </div>
  );
}
