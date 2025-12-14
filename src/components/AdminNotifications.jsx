import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [donors, setDonors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [formData, setFormData] = useState({
        targetType: 'bloodType', // 'bloodType', 'donorEmail', 'hospitalEmail', 'userId'
        bloodType: '',
        donorEmail: '',
        hospitalEmail: '',
        userId: '',
        userRole: 'Donor',
        title: '',
        message: '',
        type: 'general'
    });
    const [filterType, setFilterType] = useState('all');
    const [filterRead, setFilterRead] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const notificationTypes = ['general', 'emergency', 'appointment', 'info'];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            
            const [notificationsResponse, donorsResponse, hospitalsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/admin/donors`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/admin/hospitals`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (notificationsResponse.ok) {
                const data = await notificationsResponse.json();
                setNotifications(data);
            }

            if (donorsResponse.ok) {
                const data = await donorsResponse.json();
                setDonors(data);
            }

            if (hospitalsResponse.ok) {
                const data = await hospitalsResponse.json();
                setHospitals(data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage('Failed to load data');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const requestBody = {
                Title: formData.title,
                Message: formData.message,
                Type: formData.type
            };

            // Add targeting based on targetType
            if (formData.targetType === 'bloodType') {
                requestBody.BloodType = formData.bloodType;
            } else if (formData.targetType === 'donorEmail') {
                requestBody.DonorEmail = formData.donorEmail;
            } else if (formData.targetType === 'hospitalEmail') {
                requestBody.HospitalEmail = formData.hospitalEmail;
            } else if (formData.targetType === 'userId') {
                requestBody.UserId = formData.userId;
                requestBody.UserRole = formData.userRole;
            }

            const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message || 'Notification created successfully!');
                setMessageType('success');
                setShowCreateModal(false);
                setFormData({
                    targetType: 'bloodType',
                    bloodType: '',
                    donorEmail: '',
                    hospitalEmail: '',
                    userId: '',
                    userRole: 'Donor',
                    title: '',
                    message: '',
                    type: 'general'
                });
                await loadData();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to create notification');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error creating notification');
            setMessageType('error');
            console.error('Create notification error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (notification) => {
        setEditingNotification({ ...notification });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/notifications/${editingNotification.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Title: editingNotification.title,
                    Message: editingNotification.message,
                    Type: editingNotification.type,
                    IsRead: editingNotification.isRead
                })
            });

            if (response.ok) {
                setMessage('Notification updated successfully!');
                setMessageType('success');
                setShowEditModal(false);
                setEditingNotification(null);
                await loadData();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to update notification');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating notification');
            setMessageType('error');
            console.error('Update notification error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage('Notification deleted successfully!');
                setMessageType('success');
                await loadData();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to delete notification');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error deleting notification');
            setMessageType('error');
            console.error('Delete notification error:', error);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingNotification(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getTypeBadgeClass = (type) => {
        switch (type?.toLowerCase()) {
            case 'emergency': return 'bg-danger';
            case 'appointment': return 'bg-primary';
            case 'info': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredNotifications = notifications.filter(notif => {
        const matchesType = filterType === 'all' || notif.type === filterType;
        const matchesRead = filterRead === 'all' ||
            (filterRead === 'read' && notif.isRead) ||
            (filterRead === 'unread' && !notif.isRead);
        const matchesSearch = searchTerm === '' ||
            notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.message?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesRead && matchesSearch;
    });

    if (loading) {
        return (
            <>
                <AdminNavbar />
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
            <AdminNavbar />
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">
                        <i className="fas fa-bell me-2"></i>Notification Management
                    </h2>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <i className="fas fa-plus me-2"></i>Create Notification
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`}>
                        {message}
                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                )}

                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Filter by Type</label>
                                <select
                                    className="form-select"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    {notificationTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Filter by Status</label>
                                <select
                                    className="form-select"
                                    value={filterRead}
                                    onChange={(e) => setFilterRead(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="read">Read</option>
                                    <option value="unread">Unread</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title or message..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Table */}
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Title</th>
                                        <th>Message</th>
                                        <th>Type</th>
                                        <th>User Role</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNotifications.length > 0 ? (
                                        filteredNotifications.map(notif => (
                                            <tr key={notif.id}>
                                                <td className="fw-bold">{notif.title}</td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                                        {notif.message}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getTypeBadgeClass(notif.type)}`}>
                                                        {notif.type || 'general'}
                                                    </span>
                                                </td>
                                                <td>{notif.userRole || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${notif.isRead ? 'bg-success' : 'bg-warning'}`}>
                                                        {notif.isRead ? 'Read' : 'Unread'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(notif.createdAt)}</td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(notif)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(notif.id)}
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                No notifications found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Notification</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Target Type *</label>
                                        <select
                                            className="form-select"
                                            name="targetType"
                                            value={formData.targetType}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="bloodType">Blood Type (All donors with this blood type)</option>
                                            <option value="donorEmail">Specific Donor (by email)</option>
                                            <option value="hospitalEmail">Specific Hospital (by email)</option>
                                            <option value="userId">Specific User (by ID)</option>
                                        </select>
                                    </div>

                                    {formData.targetType === 'bloodType' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Blood Type *</label>
                                            <select
                                                className="form-select"
                                                name="bloodType"
                                                value={formData.bloodType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Blood Type</option>
                                                {bloodTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.targetType === 'donorEmail' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Donor Email *</label>
                                            <select
                                                className="form-select"
                                                name="donorEmail"
                                                value={formData.donorEmail}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Donor</option>
                                                {donors.map(donor => (
                                                    <option key={donor.id} value={donor.email}>
                                                        {donor.name} ({donor.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.targetType === 'hospitalEmail' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Hospital Email *</label>
                                            <select
                                                className="form-select"
                                                name="hospitalEmail"
                                                value={formData.hospitalEmail}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Hospital</option>
                                                {hospitals.map(hospital => (
                                                    <option key={hospital.id} value={hospital.email}>
                                                        {hospital.hospitalName || hospital.name} ({hospital.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.targetType === 'userId' && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">User ID *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="userId"
                                                    value={formData.userId}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">User Role *</label>
                                                <select
                                                    className="form-select"
                                                    name="userRole"
                                                    value={formData.userRole}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="Donor">Donor</option>
                                                    <option value="Hospital">Hospital</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Message *</label>
                                        <textarea
                                            className="form-control"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="4"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Type *</label>
                                        <select
                                            className="form-select"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {notificationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>Send Notification
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingNotification && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Notification</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingNotification(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={editingNotification.title}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Message *</label>
                                        <textarea
                                            className="form-control"
                                            name="message"
                                            value={editingNotification.message}
                                            onChange={handleEditInputChange}
                                            rows="4"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Type *</label>
                                        <select
                                            className="form-select"
                                            name="type"
                                            value={editingNotification.type}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            {notificationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="isRead"
                                                checked={editingNotification.isRead || false}
                                                onChange={handleEditInputChange}
                                                id="isReadCheck"
                                            />
                                            <label className="form-check-label" htmlFor="isReadCheck">
                                                Mark as Read
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingNotification(null);
                                        }}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNotifications;

