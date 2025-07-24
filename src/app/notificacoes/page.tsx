// src/app/notificacoes/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Ícones
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>;
const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;

const getStatusClass = (status) => {
    const statusMap = {
        'Pendente': 'status-pendente',
        'Urgente': 'status-vencida',
        'Atenção': 'status-em-andamento',
    };
    return statusMap[status] || 'status-inativa';
};

const getStatusIcon = (status) => {
    const iconMap = {
        'Urgente': <IconWarning />,
        'Atenção': <IconInfo />,
        'Pendente': <IconInfo />,
    };
    return iconMap[status] || <IconInfo />;
}

export default function NotificacoesPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para obter os IDs das notificações já lidas do localStorage
    const getReadNotificationIds = () => {
        if (typeof window !== 'undefined') {
            const readIds = localStorage.getItem('readNotifications');
            return readIds ? JSON.parse(readIds) : [];
        }
        return [];
    };

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/notificacoes');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Falha ao buscar notificações da API.');
            }
            let data = await response.json();
            
            // Filtra as notificações que já foram marcadas como lidas
            const readIds = getReadNotificationIds();
            data = data.filter(notification => !readIds.includes(notification.id));

            setNotifications(data);
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = (id) => {
        // Remove a notificação da lista na interface
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Adiciona o ID da notificação ao localStorage para que não apareça novamente
        if (typeof window !== 'undefined') {
            const readIds = getReadNotificationIds();
            if (!readIds.includes(id)) {
                const newReadIds = [...readIds, id];
                localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
            }
        }
    };

    return (
        <div className="main-content-area">
            <div className="page-header">
                <h1 className="page-title">Central de Notificações</h1>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}></th>
                                <th style={{width: '20%'}}>Tipo</th>
                                <th>Descrição</th>
                                <th style={{width: '15%'}}>Data de Referência</th>
                                <th style={{width: '10%'}}>Status</th>
                                <th style={{width: '10%', textAlign: 'right'}}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Carregando notificações...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--magnum-red-status)' }}>{error}</td></tr>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <tr key={notification.id}>
                                        <td style={{textAlign: 'center', color: 'var(--magnum-text-light)'}}>{getStatusIcon(notification.status)}</td>
                                        <td>{notification.type}</td>
                                        <td>{notification.description}</td>
                                        <td>{notification.due_date ? new Date(notification.due_date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(notification.status)}`}>
                                                {notification.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            {notification.link && <Link href={notification.link} className="btn btn-secondary btn-sm">Ver</Link>}
                                            <button onClick={() => handleMarkAsRead(notification.id)} className="btn-icon success" title="Marcar como lida">
                                                <IconCheck />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhuma notificação pendente.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
