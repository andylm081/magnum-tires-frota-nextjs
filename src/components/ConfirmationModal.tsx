'use client';

import React from 'react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  confirmButtonClass = 'btn-danger'
}) {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay open`} role="dialog" aria-modal="true" onClick={onClose}>
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
          <p>{message}</p>
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
