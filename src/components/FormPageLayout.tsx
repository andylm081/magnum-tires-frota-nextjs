// src/components/FormPageLayout.js
import React from 'react';
import Link from 'next/link';

// Ícone de Voltar Padrão
const IconBack = () => <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;

export default function FormPageLayout({ 
  title, 
  subtitle, 
  backLink, 
  actions, 
  feedback, 
  children 
}) {
  return (
    <div className="main-content-area">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          {backLink && (
            <Link href={backLink} className="btn btn-secondary">
              <IconBack />
              <span>Voltar</span>
            </Link>
          )}
        </div>

        <header className="page-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.75rem' }}>{title}</h1>
            {subtitle && (
              <p style={{ color: 'var(--magnum-text-light)', marginTop: 'var(--space-2)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {/* CORRIGIDO: O container de ações foi removido do cabeçalho */}
        </header>

        {feedback && feedback.message && (
          <div className={`form-feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        {/* O children (que contém o formulário da página) será inserido aqui */}
        {children}

        {/* CORRIGIDO: O container de ações agora é renderizado no final do card, usando a classe padrão */}
        {actions && (
            <div className="form-actions-container">
                {actions}
            </div>
        )}
      </div>
    </div>
  );
}