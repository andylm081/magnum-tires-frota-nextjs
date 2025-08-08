// src/components/Spinner.tsx
'use client';

import React from 'react';

export const Spinner = () => {
  return (
    <main className="main-content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spinner {
          width: 56px;
          height: 56px;
          border: 6px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--magnum-red, #D9252D);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div className="spinner" role="status" aria-label="carregando"></div>
    </main>
  );
};
