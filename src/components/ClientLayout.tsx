// src/components/ClientLayout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Componente de UserMenu corrigido para exibir um botão de Login
const UserMenu = () => (
    <div className="user-menu-container">
        <Link href="/login" className="btn btn-primary">
            Login
        </Link>
    </div>
);


// Ícones para os itens de navegação
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3V9H21V3M13 21H21V11H13M3 21H11V15H3M3 13H11V3H3V13Z" /></svg>;
const IconFrotas = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01M6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13S8 13.67 8 14.5S7.33 16 6.5 16M17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13S19 13.67 19 14.5S18.33 16 17.5 16M5 11L6.5 7H17.5L19 11H5Z" /></svg>;
const IconEmpresas = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>;
const IconCondutores = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>;
const IconMultas = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9,4H15V12H9V4M11,6V10H13V6H11M12,14A2,2 0 0,0 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16A2,2 0 0,0 12,14M6,2L3,5V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V5L18,2H6Z" /></svg>;
const IconNotificacoes = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  const navItems = [
    { href: '/',             label: 'Dashboard',    icon: <IconDashboard /> },
    { href: '/veiculos',     label: 'Frotas',       icon: <IconFrotas /> },
    { href: '/empresas',     label: 'Empresas',     icon: <IconEmpresas /> },
    { href: '/condutores',   label: 'Condutores',   icon: <IconCondutores /> },
    { href: '/multas',       label: 'Multas',       icon: <IconMultas /> },
    { href: '/notificacoes', label: 'Notificações', icon: <IconNotificacoes /> },
  ];
  
  // Layout para rotas de autenticação
  if (isAuthRoute) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>{children}</div>;
  }

  // Layout principal da aplicação
  return (
    <div className="app-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={pathname === '/' && item.href === '/' || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header className="main-header">
            <Link href="/">
              <Image
                src="/img/magnum-tires-logo.png"
                alt="Magnum Tires"
                width={150}
                height={40}
                priority
              />
            </Link>
          <UserMenu />
        </header>

        {/* A página (children) é renderizada aqui */}
        {children} 
        
      </div>
    </div>
  );
}
