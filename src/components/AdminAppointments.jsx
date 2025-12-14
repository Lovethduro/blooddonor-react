import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [donors, setDonors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        donorEmail: '',
        hospitalEmail: '',
        date: '',
        time: '09:00',
        bloodType: '',
        notes: '',
        status: 'Scheduled'
    });

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
        '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            
            // Load appointments
            const appointmentsResponse = await fetch(`${API_BASE_URL}/admin/appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                setAppointments(appointmentsData);
            }

            // Load donors
            const donorsResponse = await fetch(`${API_BASE_URL}/admin/donors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (donorsResponse.ok) {
                const donorsData = await donorsResponse.json();
                setDonors(donorsData);
            }

            // Load hospitals
            const hospitalsResponse = await fetch(`${API_BASE_URL}/admin/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (hospitalsResponse.ok) {
                const hospitalsData = await hospitalsResponse.json();
                setHospitals(hospitalsData);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    DonorEmail: formData.donorEmail,
                    HospitalEmail: formData.hospitalEmail,
                    Date: formData.date,
                    Time: formData.time,
                    BloodType: formData.bloodType,
                    Notes: formData.notes
                })
            });

            if (response.ok) {
                setMessage('Appointment created successfully!');
                setMessageType('success');
                setShowCreateModal(false);
                setFormData({
                    donorEmail: '',
                    hospitalEmail: '',
                    date: '',
                    time: '09:00',
                    bloodType: '',
                    notes: '',
                    status: 'Scheduled'
                });
                await loadData();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to create appointment');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error creating appointment');
            setMessageType('error');
            console.error('Create appointment error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (appointment) => {
        setEditingAppointment({
            ...appointment,
            donorEmail: appointment.donorEmail || donors.find(d => d.id === appointment.donorId)?.email || '',
            hospitalEmail: appointment.hospitalEmail || hospitals.find(h => h.id === appointment.hospitalId)?.email || '',
            date: appointment.date ? (typeof appointment.date === 'string' ? appointment.date.split('T')[0] : new Date(appointment.date).toISOString().split('T')[0]) : ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${editingAppointment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    DonorEmail: editingAppointment.donorEmail,
                    HospitalEmail: editingAppointment.hospitalEmail,
                    Date: editingAppointment.date,
                    Time: editingAppointment.time,
                    Status: editingAppointment.status,
                    BloodType: editingAppointment.bloodType,
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
                await loadData();
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

    const handleDelete = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage('Appointment deleted successfully!');
                setMessageType('success');
                await loadData();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to delete appointment');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error deleting appointment');
            setMessageType('error');
            console.error('Delete appointment error:', error);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingAppointment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'bg-primary';
            case 'confirmed':
                return 'bg-info';
            case 'completed':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            appointment.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.bloodType?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
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
                        <i className="fas fa-calendar-check me-2"></i>Appointment Management
                    </h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fas fa-plus me-2"></i>Create Appointment
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
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Filter by Status</label>
                                <select
                                    className="form-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-bold">Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by donor name, hospital, or blood type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Table */}
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Donor</th>
                                        <th>Hospital</th>
                                        <th>Blood Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map(appointment => (
                                            <tr key={appointment.id}>
                                                <td>
                                                    <div>
                                                        <strong>{formatDate(appointment.date)}</strong>
                                                        <div className="text-muted small">{formatTime(appointment.time)}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-bold">{appointment.donorName || 'Unknown'}</div>
                                                        <small className="text-muted">{appointment.donorEmail || ''}</small>
                                                    </div>
                                                </td>
                                                <td>{appointment.hospitalName || 'Unknown'}</td>
                                                <td>
                                                    <span className="badge bg-danger">{appointment.bloodType || 'N/A'}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(appointment)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(appointment.id)}
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
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                No appointments found
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
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Appointment</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="modal-body">
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
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Time *</label>
                                            <select
                                                className="form-select"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {timeSlots.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
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
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Notes</label>
                                        <textarea
                                            className="form-control"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Any special notes or requirements..."
                                        ></textarea>
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
                                                <i className="fas fa-save me-2"></i>Create Appointment
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
            {showEditModal && editingAppointment && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Appointment</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingAppointment(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Donor Email *</label>
                                            <select
                                                className="form-select"
                                                name="donorEmail"
                                                value={editingAppointment.donorEmail || ''}
                                                onChange={handleEditInputChange}
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
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Hospital Email *</label>
                                            <select
                                                className="form-select"
                                                name="hospitalEmail"
                                                value={editingAppointment.hospitalEmail || ''}
                                                onChange={handleEditInputChange}
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
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-bold">Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="date"
                                                value={editingAppointment.date}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-bold">Time *</label>
                                            <select
                                                className="form-select"
                                                name="time"
                                                value={editingAppointment.time}
                                                onChange={handleEditInputChange}
                                                required
                                            >
                                                {timeSlots.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-bold">Status *</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={editingAppointment.status}
                                                onChange={handleEditInputChange}
                                                required
                                            >
                                                {statuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Blood Type *</label>
                                            <select
                                                className="form-select"
                                                name="bloodType"
                                                value={editingAppointment.bloodType}
                                                onChange={handleEditInputChange}
                                                required
                                            >
                                                {bloodTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                    {editingAppointment.preferredArm && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Preferred Arm</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="preferredArm"
                                                value={editingAppointment.preferredArm}
                                                onChange={handleEditInputChange}
                                            />
                                        </div>
                                    )}
                                    {editingAppointment.accessibilityNeeds && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Accessibility Needs</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="accessibilityNeeds"
                                                value={editingAppointment.accessibilityNeeds || ''}
                                                onChange={handleEditInputChange}
                                            />
                                        </div>
                                    )}
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
        </>
    );
};

export default AdminAppointments;

