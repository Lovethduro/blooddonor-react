import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalNavbar from './HospitalNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [formData, setFormData] = useState({
        donorEmail: '',
        date: '',
        time: '',
        bloodType: '',
        notes: ''
    });
    const [editFormData, setEditFormData] = useState({
        status: '',
        date: '',
        time: '',
        notes: ''
    });

    const statusOptions = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            const response = await fetch(`${API_BASE_URL}/auth/hospital/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            } else {
                setMessage('Failed to load appointments');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            setMessage('Error loading appointments');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            const response = await fetch(`${API_BASE_URL}/auth/hospital/appointments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    donorEmail: formData.donorEmail,
                    date: formData.date,
                    time: formData.time,
                    bloodType: formData.bloodType || undefined,
                    notes: formData.notes || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Appointment created successfully!');
                setMessageType('success');
                setShowCreateModal(false);
                setFormData({
                    donorEmail: '',
                    date: '',
                    time: '',
                    bloodType: '',
                    notes: ''
                });
                loadAppointments();
            } else {
                setMessage(data.message || 'Failed to create appointment');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            setMessage('Error creating appointment');
            setMessageType('error');
        }
    };

    const handleEditClick = (appointment) => {
        setEditingAppointment(appointment);
        setEditFormData({
            status: appointment.status,
            date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
            time: appointment.time || '',
            notes: appointment.notes || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            const response = await fetch(`${API_BASE_URL}/auth/hospital/appointments/${editingAppointment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: editFormData.status || undefined,
                    date: editFormData.date || undefined,
                    time: editFormData.time || undefined,
                    notes: editFormData.notes || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Appointment updated successfully!');
                setMessageType('success');
                setShowEditModal(false);
                setEditingAppointment(null);
                loadAppointments();
            } else {
                setMessage(data.message || 'Failed to update appointment');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            setMessage('Error updating appointment');
            setMessageType('error');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'bg-primary';
            case 'confirmed':
                return 'bg-info';
            case 'in progress':
                return 'bg-warning';
            case 'completed':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                    <h2 className="fw-bold">Appointments Management</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fas fa-plus me-2"></i>Create Appointment
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
                        {appointments.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No appointments found. Create your first appointment!</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Donor Name</th>
                                            <th>Donor Email</th>
                                            <th>Blood Type</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td>{appointment.donorName || 'Unknown'}</td>
                                                <td>{appointment.donorEmail || 'N/A'}</td>
                                                <td>
                                                    <span className="badge bg-danger">{appointment.bloodType}</span>
                                                </td>
                                                <td>{formatDate(appointment.date)}</td>
                                                <td>{appointment.time}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td>{appointment.notes || '-'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditClick(appointment)}
                                                    >
                                                        <i className="fas fa-edit"></i> Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Appointment Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Appointment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Donor Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.donorEmail}
                                            onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                                            required
                                            placeholder="donor@example.com"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Time *</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Blood Type (Optional)</label>
                                        <select
                                            className="form-select"
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        >
                                            <option value="">Select blood type</option>
                                            {bloodTypes.map(bt => (
                                                <option key={bt} value={bt}>{bt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Notes (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Additional notes..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Appointment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Appointment Modal */}
            {showEditModal && editingAppointment && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Appointment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Donor</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={`${editingAppointment.donorName || 'Unknown'} (${editingAppointment.donorEmail || 'N/A'})`}
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status *</label>
                                        <select
                                            className="form-select"
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            required
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editFormData.date}
                                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={editFormData.time}
                                            onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Notes</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={editFormData.notes}
                                            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                            placeholder="Additional notes..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Update Appointment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HospitalAppointments;

