// src/components/UserMenu.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Carrega sessão inicial e escuta mudanças
  useEffect(() => {
    // v2: getSession retorna { data: { session } }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });

    // onAuthStateChange retorna { data: { subscription } }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    // desinscreve corretamente
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!email) {
    return (
      <Link href="/login" className="btn btn-primary">
        Login
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded"
      >
        <span className="truncate max-w-xs">{email}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-30">
          <li>
            <Link href="/perfil" className="block px-4 py-2 hover:bg-gray-100">
              Meu Perfil
            </Link>
          </li>
          <li>
            <Link href="/usuarios/invite" className="block px-4 py-2 hover:bg-gray-100">
              Convidar Usuário
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
