// src/app/layout.tsx (Server Component)
import './globals.css'
import React from 'react'
import ClientLayout from '@/components/ClientLayout'

export const metadata = {
  title: 'Magnum Tires - Gestão de Frotas',
  description: 'Sistema de gerenciamento de frotas da Magnum Tires',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
