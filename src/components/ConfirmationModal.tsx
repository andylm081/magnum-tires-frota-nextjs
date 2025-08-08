// src/components/ConfirmationModal.tsx
'use client';

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // Alterado de string para React.ReactNode
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  confirmButtonClass = 'btn-danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </header>

        <div className="modal-body">
          {message} {/* Agora pode renderizar JSX diretamente */}
        </div>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelButtonText}
          </button>
          <button className={`btn ${confirmButtonClass}`} onClick={onConfirm}>
            {confirmButtonText}
          </button>
        </footer>
      </div>
    </div>
  );
}
