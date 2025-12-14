import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        unreadOnly: false,
        priority: ''
    });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const fetchMessages = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            if (filter.unreadOnly) params.append('unreadOnly', 'true');
            if (filter.priority) params.append('priority', filter.priority);

            const response = await fetch(`${API_BASE_URL}/admin/messages?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            } else {
                throw new Error('Failed to load messages');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}/mark-read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, isRead: true } : msg
                ));
                setMessage('Message marked as read');
                setMessageType('success');
            } else {
                throw new Error('Failed to mark message as read');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
                setMessage('Message deleted successfully');
                setMessageType('success');
                if (selectedMessage && selectedMessage.id === messageId) {
                    setSelectedMessage(null);
                }
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            'Low': 'secondary',
            'Normal': 'info',
            'High': 'warning',
            'Urgent': 'danger'
        };
        return colors[priority] || 'secondary';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Technical Support': 'fas fa-wrench',
            'Account Issue': 'fas fa-user-shield',
            'Feature Request': 'fas fa-lightbulb',
            'Donor Management': 'fas fa-users',
            'Other': 'fas fa-question-circle'
        };
        return icons[category] || 'fas fa-envelope';
    };

    const unreadCount = messages.filter(msg => !msg.isRead).length;

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <div className="container-fluid py-4">
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
            <AdminNavbar />

            {/* Success/Error Messages */}
            {message && (
                <div className="position-fixed top-0 end-0 p-3" style={{zIndex: 1050}}>
                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                        <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                        {message}
                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                </div>
            )}

            <div className="container-fluid py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 className="h2 fw-bold text-primary">
                                    <i className="fas fa-envelope me-2"></i>Contact Messages
                                    {unreadCount > 0 && (
                                        <span className="badge bg-danger ms-2">{unreadCount} unread</span>
                                    )}
                                </h1>
                                <p className="text-muted">All contact messages from hospitals and public users</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Messages List */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        <i className="fas fa-list me-2"></i>Messages ({messages.length})
                                    </h5>

                                    {/* Filters */}
                                    <div className="d-flex gap-2">
                                        <select
                                            className="form-select form-select-sm"
                                            value={filter.priority}
                                            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
                                        >
                                            <option value="">All Priorities</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="High">High</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Low">Low</option>
                                        </select>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="unreadOnly"
                                                checked={filter.unreadOnly}
                                                onChange={(e) => setFilter(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                                            />
                                            <label className="form-check-label text-white" htmlFor="unreadOnly">
                                                Unread only
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0" style={{maxHeight: '600px', overflowY: 'auto'}}>
                                {messages.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">No messages found</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`message-item p-3 border-bottom ${!msg.isRead ? 'bg-light' : ''} ${selectedMessage?.id === msg.id ? 'bg-primary bg-opacity-10' : ''}`}
                                            style={{cursor: 'pointer'}}
                                            onClick={() => setSelectedMessage(msg)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <i className={`${getCategoryIcon(msg.category)} text-primary`}></i>
                                                        <strong className="text-truncate">{msg.name}</strong>
                                                        {!msg.isRead && (
                                                            <span className="badge bg-danger">New</span>
                                                        )}
                                                    </div>
                                                    <p className="text-muted small mb-1 text-truncate">{msg.subject}</p>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge bg-${getPriorityBadge(msg.priority)} mb-1`}>
                                                        {msg.priority}
                                                    </span>
                                                    <div className="text-muted small">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0 text-truncate">
                                                {msg.message.length > 100 ? `${msg.message.substring(0, 100)}...` : msg.message}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Message Details */}
                    <div className="col-lg-7">
                        {selectedMessage ? (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="card-title mb-0">
                                                <i className="fas fa-envelope-open me-2"></i>{selectedMessage.subject}
                                            </h5>
                                            <small className="text-muted">
                                                From: {selectedMessage.name} ({selectedMessage.email})
                                            </small>
                                        </div>
                                        <div className="d-flex gap-2">
                                            {!selectedMessage.isRead && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => markAsRead(selectedMessage.id)}
                                                >
                                                    <i className="fas fa-check me-1"></i>Mark as Read
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                            >
                                                <i className="fas fa-trash me-1"></i>Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Priority:</strong>
                                            <span className={`badge bg-${getPriorityBadge(selectedMessage.priority)} ms-2`}>
                                                {selectedMessage.priority}
                                            </span>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Category:</strong>
                                            <span className="ms-2">
                                                <i className={`${getCategoryIcon(selectedMessage.category)} me-1`}></i>
                                                {selectedMessage.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <strong>Source:</strong>
                                            <span className={`badge bg-${selectedMessage.userRole === 'Hospital' ? 'primary' : 'info'} ms-2`}>
                                                {selectedMessage.userRole || 'Public'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <strong>Received:</strong>
                                            <span className="ms-2">
                                                {new Date(selectedMessage.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <hr />

                                    <div>
                                        <strong>Message:</strong>
                                        <div className="mt-3 p-3 bg-light rounded">
                                            {selectedMessage.message.split('\n').map((line, index) => (
                                                <p key={index} className="mb-2">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-envelope-open fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">Select a message to view details</h5>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .message-item:hover {
                    background-color: rgba(0, 123, 255, 0.05) !important;
                }

                .message-item.selected {
                    background-color: rgba(0, 123, 255, 0.1) !important;
                    border-left: 3px solid #0d6efd;
                }
            `}</style>
        </>
    );
};

export default AdminMessages;
