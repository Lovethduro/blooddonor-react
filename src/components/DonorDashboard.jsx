import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const DonorDashboard = () => {
    const navigate = useNavigate();
    const [donorInfo, setDonorInfo] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Load donor profile
            const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();

                // Backend now returns properly formatted address string
                setDonorInfo(profileData);
            }

            // Load appointments from API
            const appointmentsResponse = await fetch(`${API_BASE_URL}/auth/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                setAppointments(appointmentsData);
            } else {
                console.error('Failed to load appointments');
                setAppointments([]);
            }

            // Load notifications from API
            const notificationsResponse = await fetch(`${API_BASE_URL}/auth/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                setNotifications(notificationsData);
            } else {
                console.error('Failed to load notifications');
                setNotifications([]);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setMessage('Failed to load dashboard data');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'bg-primary';
            case 'confirmed':
                return 'bg-success';
            case 'completed':
                return 'bg-info';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        // Assuming time is in HH:MM format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'appointment':
                return 'fas fa-calendar-check';
            case 'emergency':
                return 'fas fa-exclamation-triangle';
            case 'general':
            default:
                return 'fas fa-info-circle';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'appointment':
                return '#0d6efd';
            case 'emergency':
                return '#dc3545';
            case 'general':
            default:
                return '#198754';
        }
    };

    const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

    const handleEditAppointment = (appointment) => {
        setEditingAppointment({
            ...appointment,
            date: appointment.date ? (typeof appointment.date === 'string' ? appointment.date.split('T')[0] : new Date(appointment.date).toISOString().split('T')[0]) : ''
        });
        setShowEditModal(true);
    };

    const handleUpdateAppointment = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/appointments/${editingAppointment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Date: editingAppointment.date,
                    Time: editingAppointment.time,
                    Status: editingAppointment.status,
                    Notes: editingAppointment.notes || '',
                    PreferredArm: editingAppointment.preferredArm || '',
                    AccessibilityNeeds: editingAppointment.accessibilityNeeds || ''
                })
            });

            if (response.ok) {
                setMessage('Appointment updated successfully!');
                setMessageType('success');
                setShowEditModal(false);
                setEditingAppointment(null);
                
                // Reload appointments
                const token = sessionStorage.getItem('token');
                const appointmentsResponse = await fetch(`${API_BASE_URL}/auth/appointments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (appointmentsResponse.ok) {
                    const appointmentsData = await appointmentsResponse.json();
                    setAppointments(appointmentsData);
                }
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to update appointment');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating appointment');
            setMessageType('error');
            console.error('Update appointment error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingAppointment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5>Loading your dashboard...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="donor-dashboard">
            {/* HERO SECTION */}
            <section className="text-center py-5 text-white"
                     style={{background: 'linear-gradient(135deg, #0d3b64 0%, #355677 100%)'}}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="text-start">
                            <h1 className="fw-bold display-5 mb-2">
                                <i className="fas fa-tachometer-alt me-3"></i>Donor Dashboard
                            </h1>
                            <p className="lead mb-0">
                                Welcome back, <strong>{donorInfo?.name || 'Donor'}</strong>!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN DASHBOARD CONTENT */}
            <section className="container my-5">
                {message && (
                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`}>
                        {message}
                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                )}

                <div className="row g-4">
                    {/* Appointments Grid - Full width */}
                    <div className="col-12">
                        <div className="card border-0 shadow-lg">
                            <div className="card-header text-white py-4"
                                 style={{background: 'linear-gradient(135deg, #0d3b64 0%, #355677 100%)', borderBottom: 'none'}}>
                                <h4 className="fw-bold mb-0 text-center">
                                    <i className="fas fa-list-check me-2"></i>Appointments
                                </h4>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    {appointments.length > 0 ? (
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="fw-bold py-3">Date</th>
                                                    <th className="fw-bold py-3">Status</th>
                                                    <th className="fw-bold py-3">Hospital</th>
                                                    <th className="fw-bold py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map(appointment => (
                                                    <tr key={appointment.id}>
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3">
                                                                    <i className="fas fa-calendar-day text-primary"></i>
                                                                </div>
                                                                <div>
                                                                    <strong>{formatDate(appointment.date)}</strong>
                                                                    <div className="text-muted small">{formatTime(appointment.time)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`badge rounded-pill ${getStatusBadgeClass(appointment.status)}`}>
                                                                {appointment.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                <i className="fas fa-hospital text-muted me-1"></i>
                                                                {appointment.hospitalName || 'Not specified'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-outline-primary"
                                                                    onClick={() => handleEditAppointment(appointment)}
                                                                    title="Edit Appointment"
                                                                >
                                                                    <i className="fas fa-edit me-1"></i>Edit
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No appointments scheduled</h5>
                                            <p className="text-muted mb-0">Schedule your first donation appointment today!</p>
                                            <button className="btn btn-primary mt-3" onClick={() => navigate('/donor-register')}>
                                                <i className="fas fa-plus me-2"></i>Schedule Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATIONS SECTION */}
                <div className="row mt-4 g-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-lg">
                            <div className="card-header text-white py-4"
                                 style={{background: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)', borderBottom: 'none'}}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="fw-bold mb-0">
                                        <i className="fas fa-bell me-2"></i>Notifications
                                    </h4>
                                    {unreadNotificationsCount > 0 && (
                                        <span className="badge bg-light text-dark">{unreadNotificationsCount}</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body p-0">
                                <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <div key={notification.id} className="p-4 border-bottom">
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0">
                                                        <div
                                                            className="p-3 rounded-circle"
                                                            style={{backgroundColor: `${getNotificationColor(notification.type)}20`}}
                                                        >
                                                            <i
                                                                className={`${getNotificationIcon(notification.type)} fa-lg`}
                                                                style={{color: getNotificationColor(notification.type)}}
                                                            ></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1 ms-3">
                                                        <h5 className="fw-bold mb-2" style={{color: '#0d3b64'}}>
                                                            {notification.title}
                                                        </h5>
                                                        <p className="text-muted mb-2">{notification.message}</p>
                                                        <small className="text-muted">
                                                            <i className="fas fa-clock me-1"></i>
                                                            {new Date(notification.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                                            <p className="text-muted mb-0">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Edit Appointment Modal */}
            {showEditModal && editingAppointment && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-edit me-2"></i>Edit Appointment
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingAppointment(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdateAppointment}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="date"
                                            value={editingAppointment.date}
                                            onChange={handleEditInputChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Time *</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="time"
                                            value={editingAppointment.time}
                                            onChange={handleEditInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Status *</label>
                                        <select
                                            className="form-select"
                                            name="status"
                                            value={editingAppointment.status}
                                            onChange={handleEditInputChange}
                                            required
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Notes</label>
                                        <textarea
                                            className="form-control"
                                            name="notes"
                                            value={editingAppointment.notes || ''}
                                            onChange={handleEditInputChange}
                                            rows="3"
                                            placeholder="Any special notes or requirements..."
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Preferred Arm</label>
                                        <select
                                            className="form-select"
                                            name="preferredArm"
                                            value={editingAppointment.preferredArm || ''}
                                            onChange={handleEditInputChange}
                                        >
                                            <option value="">No preference</option>
                                            <option value="Left">Left Arm</option>
                                            <option value="Right">Right Arm</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Accessibility Needs</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="accessibilityNeeds"
                                            value={editingAppointment.accessibilityNeeds || ''}
                                            onChange={handleEditInputChange}
                                            placeholder="E.g., wheelchair access, sign language interpreter"
                                        />
                                    </div>
                                    <div className="alert alert-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            <strong>Hospital:</strong> {editingAppointment.hospitalName || 'Not specified'}
                                        </small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingAppointment(null);
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
        </div>
    );
};

export default DonorDashboard;
