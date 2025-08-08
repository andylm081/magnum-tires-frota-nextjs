// src/components/ProtectedPage.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedPageProps {
  children: React.ReactNode;
  skeleton: React.ReactNode; // Prop para passar o esqueleto específico
  adminOnly?: boolean; // Nova prop para proteger páginas de admin
}

export default function ProtectedPage({ children, skeleton, adminOnly = false }: ProtectedPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Se a página é apenas para admins e o utilizador não é admin, redireciona
    if (status === 'authenticated' && adminOnly && session.user?.role !== 'ADMIN') {
      router.push('/'); // Redireciona para o dashboard
    }
  }, [status, session, router, adminOnly]);

  // Mostra o esqueleto enquanto a sessão está a ser verificada
  if (status === 'loading') {
    return <>{skeleton}</>;
  }

  // Se a página é para admin e o utilizador não é, não mostra nada enquanto redireciona
  if (adminOnly && session?.user?.role !== 'ADMIN') {
    return null;
  }

  // Se tudo estiver correto, mostra o conteúdo da página
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}