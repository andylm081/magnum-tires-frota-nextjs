// src/components/PageSkeleton.tsx
'use client';

import React from 'react';

// Estilo para a animação de pulso
const skeletonPulseStyle: React.CSSProperties = {
  backgroundColor: '#e0e0e0',
  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

export const SkeletonBox = ({ width = '100%', height = '20px' }: { width?: string, height?: string }) => (
  <div style={{ ...skeletonPulseStyle, width, height, borderRadius: '4px' }} />
);

interface PageSkeletonProps {
  pageTitle?: string;
  showActionButton?: boolean;
  children: React.ReactNode;
}

export const PageSkeleton = ({ pageTitle = "Carregando...", showActionButton = true, children }: PageSkeletonProps) => {
  return (
    <main className="main-content-area">
      <style>{`
        @keyframes pulse {
          50% { opacity: .5; }
        }
      `}</style>
      <div className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        {showActionButton && <SkeletonBox width="120px" height="38px" />}
      </div>

      {children}
    </main>
  );
}
