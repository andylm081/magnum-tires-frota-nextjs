'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export default function GerenciarUsuariosPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({ email: '', user_role: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('utilizador');
  const [isInviting, setIsInviting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);
      // CORRIGIDO: user_role agora em user_metadata
      if (currentUser?.user_metadata?.user_role !== 'admin') {
        setAccessDenied(true);
      } else {
        fetchUsers();
      }
    };
    init();
  }, [fetchUsers, supabase]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        setInviteEmail('');
        setTimeout(fetchUsers, 1500);
      } else {
        setFeedback({ type: 'error', message: data.error });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsInviting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      user_role: user.app_metadata?.role || '',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setShowEditModal(false);
      fetchUsers();
    } else {
      alert('Erro ao editar usuário');
    }
  };

  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setShowDeleteModal(false);
      fetchUsers();
    } else {
      alert('Erro ao remover usuário');
    }
  };

  if (accessDenied) {
    return <div className="card"><h1 className="page-title">Acesso Negado</h1></div>;
  }

  return (
    <div className="main-content-area">
      <div className="page-header">
        <h1 className="page-title">Gerenciamento de Utilizadores</h1>
      </div>

      <div className="card">
        <h2 className="section-title">Convidar Novo Utilizador</h2>
        {feedback.message && <div className={`form-feedback-message ${feedback.type}`}>{feedback.message}</div>}
        <form onSubmit={handleInviteSubmit} className="form-grid cols-3 align-items-end">
          <div className="form-item">
            <label>Email</label>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
          </div>
          <div className="form-item">
            <label>Função</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="utilizador">Utilizador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="form-item">
            <button className="btn btn-primary" type="submit" disabled={isInviting}>
              <IconUserPlus />
              {isInviting ? 'A Enviar...' : 'Enviar Convite'}
            </button>
          </div>
        </form>
      </div>

      <div className="card table-container">
        <h2 className="section-title">Utilizadores Registados</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Função</th>
              <th>Último Acesso</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              // CORRIGIDO: colSpan é número, não string!
              <tr><td colSpan={5}>Nenhum utilizador encontrado.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    {u.app_metadata?.role === 'admin'
                      ? 'Administrador'
                      : u.app_metadata?.role === 'utilizador'
                      ? 'Utilizador'
                      : 'N/A'}
                  </td>
                  <td>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}</td>
                  <td>{u.email_confirmed_at ? 'Confirmado' : 'Aguardando'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-dark" onClick={() => openEditModal(u)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDeleteUser(u)} style={{ marginLeft: '0.5rem' }}>Remover</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay open">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <h2>Editar Utilizador</h2>
            <div className="form-item">
              <label>Email</label>
              <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
            </div>
            <div className="form-item">
              <label>Função</label>
              <select value={editData.user_role} onChange={(e) => setEditData({ ...editData, user_role: e.target.value })}>
                <option value="utilizador">Utilizador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleEditSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remoção */}
      {showDeleteModal && (
        <div className="modal-overlay open">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <h2>Confirmar Remoção</h2>
            <p>Deseja mesmo remover o utilizador <strong>{selectedUser?.email}</strong>?</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
