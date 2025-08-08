// src/app/admin/usuarios/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

const IconUserPlus = () => (
 <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
   <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
 </svg>
);

// Ícones para as ações da tabela
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);


export default function GerenciarUsuariosPage() {
 const { data: session, status } = useSession();
 const router = useRouter();

 const [users, setUsers] = useState<any[]>([]);
 const [selectedUser, setSelectedUser] = useState<any>(null);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [editData, setEditData] = useState({ email: '', role: '' });

 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteRole, setInviteRole] = useState('USER');
 const [isInviting, setIsInviting] = useState(false);

 const [feedback, setFeedback] = useState({ type: '', message: '' });
 const [isLoading, setIsLoading] = useState(true);

 const fetchUsers = useCallback(async () => {
   try {
     const res = await fetch('/api/admin/users');
     if (!res.ok) throw new Error('Falha ao buscar utilizadores');
     const data = await res.json();
     setUsers(data);
   } catch (err: any) {
     setFeedback({ type: 'error', message: err.message });
   } finally {
     setIsLoading(false);
   }
 }, []);

 useEffect(() => {
   if (status === 'authenticated') {
     if (session.user?.role === 'ADMIN') {
       fetchUsers();
     } else {
       router.push('/'); // Redireciona se não for admin
     }
   }
   if (status === 'unauthenticated') {
     router.push('/login');
   }
 }, [status, session, router, fetchUsers]);

 const handleInviteSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsInviting(true);
   setFeedback({ type: '', message: '' });
   try {
     const res = await fetch('/api/admin/invite', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error);

     setFeedback({ type: 'success', message: data.message });
     setInviteEmail('');
     fetchUsers(); // Atualiza a lista de utilizadores
   } catch (err: any) {
     setFeedback({ type: 'error', message: err.message });
   } finally {
     setIsInviting(false);
   }
 };

 const openEditModal = (user: any) => {
   setSelectedUser(user);
   setEditData({ email: user.email, role: user.role });
   setShowEditModal(true);
 };

 const handleEditSave = async () => {
   try {
     const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(editData),
     });
     if (!res.ok) throw new Error('Falha ao editar utilizador');
     setShowEditModal(false);
     fetchUsers();
   } catch (err) {
     alert((err as Error).message);
   }
 };

 const openDeleteModal = (user: any) => {
   setSelectedUser(user);
   setShowDeleteModal(true);
 };

 const handleDelete = async () => {
   try {
     const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
       method: 'DELETE',
     });
     if (!res.ok) throw new Error('Falha ao remover utilizador');
     setShowDeleteModal(false);
     fetchUsers();
   } catch (err) {
     alert((err as Error).message);
   }
 };

 if (status === 'loading' || isLoading) {
   return <main className="main-content-area"><div className="card">A carregar...</div></main>;
 }

 return (
   <>
     <main className="main-content-area">
       <div className="page-header">
         <h1 className="page-title">Gerenciamento de Utilizadores</h1>
       </div>

       <div className="card">
         <h2 className="section-title">Convidar Novo Utilizador</h2>
         {feedback.message && <div className={`form-feedback-message ${feedback.type}`}>{feedback.message}</div>}
         <form onSubmit={handleInviteSubmit} className="form-grid cols-3 align-items-end">
           <div className="form-item">
             <label>Email</label>
             <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
           </div>
           <div className="form-item">
             <label>Função</label>
             <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
               <option value="USER">Utilizador</option>
               <option value="MODERATOR">Moderador</option>
               <option value="ADMIN">Administrador</option>
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
               <th>Nome Completo</th>
               <th>Função</th>
               <th>Data de Criação</th>
               <th>Ações</th>
             </tr>
           </thead>
           <tbody>
             {users.length === 0 ? (
               <tr><td colSpan={5}>Nenhum utilizador encontrado.</td></tr>
             ) : (
               users.map((u) => (
                 <tr key={u.id}>
                   <td>{u.email}</td>
                   <td>{u.Profile?.nomeCompleto || 'Não preenchido'}</td>
                   <td>{u.role}</td>
                   <td>{new Date(u.createdAt).toLocaleString('pt-BR')}</td>
                   <td className="actions-cell">
                      <button className="btn-icon warning" title="Editar" onClick={() => openEditModal(u)}>
                        <IconEdit />
                      </button>
                      <button className="btn-icon" title="Remover" onClick={() => openDeleteModal(u)}>
                        <IconDelete />
                      </button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
     </main>

     <ConfirmationModal
       isOpen={showEditModal}
       onClose={() => setShowEditModal(false)}
       onConfirm={handleEditSave}
       title="Editar Utilizador"
       confirmButtonText="Salvar"
       confirmButtonClass="btn-primary"
       message={(
         <>
           <div className="form-item">
             <label>Email</label>
             <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
           </div>
           <div className="form-item">
             <label>Função</label>
             <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
               <option value="USER">Utilizador</option>
               <option value="MODERATOR">Moderador</option>
               <option value="ADMIN">Administrador</option>
             </select>
           </div>
         </>
       )}
     />

     <ConfirmationModal
       isOpen={showDeleteModal}
       onClose={() => setShowDeleteModal(false)}
       onConfirm={handleDelete}
       title="Confirmar Remoção"
       message={`Deseja mesmo remover o utilizador ${selectedUser?.email}?`}
     />
   </>
 );
}
