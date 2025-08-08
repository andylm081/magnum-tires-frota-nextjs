// src/app/layout.tsx
import './globals.css'
import React from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import ClientLayout from '@/components/ClientLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Magnum Tires - Gestão de Frotas',
  description: 'Sistema de gerenciamento de frotas da Magnum Tires',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}