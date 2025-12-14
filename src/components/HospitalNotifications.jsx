import React, { useState, useEffect } from 'react';
import HospitalNavbar from './HospitalNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            const response = await fetch(`${API_BASE_URL}/auth/hospital/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            } else {
                setMessage('Failed to load notifications');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            setMessage('Error loading notifications');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            const response = await fetch(`${API_BASE_URL}/auth/hospital/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update local state
                setNotifications(notifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type?.toLowerCase()) {
            case 'emergency':
                return 'bg-danger';
            case 'appointment':
                return 'bg-info';
            case 'general':
                return 'bg-secondary';
            default:
                return 'bg-primary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <>
                <HospitalNavbar />
                <div className="container py-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HospitalNavbar />
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold">Notifications</h2>
                        <p className="text-muted mb-0">
                            {unreadCount > 0 ? (
                                <span className="badge bg-danger">{unreadCount} unread</span>
                            ) : (
                                <span className="text-muted">All notifications read</span>
                            )}
                        </p>
                    </div>
                    <button
                        className="btn btn-outline-primary"
                        onClick={loadNotifications}
                    >
                        <i className="fas fa-sync me-2"></i>Refresh
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                        {message}
                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                )}

                <div className="card shadow-sm">
                    <div className="card-body">
                        {notifications.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No notifications yet.</p>
                            </div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`list-group-item list-group-item-action ${
                                            !notification.isRead ? 'bg-light' : ''
                                        }`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                        style={{ cursor: !notification.isRead ? 'pointer' : 'default' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="mb-0 me-2">
                                                        {notification.title}
                                                        {!notification.isRead && (
                                                            <span className="badge bg-primary ms-2">New</span>
                                                        )}
                                                    </h6>
                                                    <span className={`badge ${getTypeBadgeClass(notification.type)}`}>
                                                        {notification.type || 'general'}
                                                    </span>
                                                </div>
                                                <p className="mb-1">{notification.message}</p>
                                                <small className="text-muted">
                                                    <i className="fas fa-clock me-1"></i>
                                                    {formatDate(notification.createdAt)}
                                                </small>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                >
                                                    <i className="fas fa-check"></i> Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HospitalNotifications;

