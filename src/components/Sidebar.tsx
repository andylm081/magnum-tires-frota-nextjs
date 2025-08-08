'use client'

import { useState } from 'react'
import Link from 'next/link'
import React from 'react'

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/>
        </svg>
      )
    },
    {
      label: 'Frotas',
      href: '/frotas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9V5H6.5C5.84 5 5.28
            5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0
            .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67
            13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5
            1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      )
    },
    {
      label: 'Empresas',
      href: '/empresas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M4 4h12v16H4z"/>
        </svg>
      )
    },
    {
      label: 'Condutores',
      href: '/condutores',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4
            1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8
            4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
    {
      label: 'Multas',
      href: '/multas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M2 5v6h2v4h12v-4h2V5H2z"/>
        </svg>
      )
    },
    {
      label: 'Notificações',
      href: '/notificacoes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="currentColor">
          <path d="M10 2C8.34 2 7 3.34 7 5v3C4.79 8
            3 9.79 3 12v3h14v-3c0-2.21-1.79-4-4-4V5c0-1.66-1.34-3-3-3z"/>
        </svg>
      )
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 sm:static sm:inset-auto
        `}
      >
        <nav className="mt-8 space-y-1 px-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100"
            >
              {item.icon}
              <span className="text-gray-800">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Hamburger */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 p-4 sm:hidden">
          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
          <span className="text-lg font-semibold">Magnum Tires</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
