import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminHospitalManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminHospitalManagement = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, verified, unverified
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        hospitalName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        latitude: null,
        longitude: null,
        contactPerson: ''
    });

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            const token = sessionStorage.getItem('token');
            console.log('Loading hospitals...');
            console.log('API URL:', `${API_BASE_URL}/admin/hospitals`);
            console.log('Token exists:', !!token);

            const response = await fetch(`${API_BASE_URL}/admin/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Hospitals data:', data);
                console.log('Number of hospitals:', Array.isArray(data) ? data.length : 'Not an array');
                setHospitals(Array.isArray(data) ? data : []);
            } else {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                setMessage('Failed to load hospitals');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Load hospitals error:', error);
            setMessage('Error loading hospitals');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const toggleVerificationStatus = async (hospitalId, currentStatus) => {
        const action = currentStatus ? 'mark as pending' : 'verify';
        if (!window.confirm(`Are you sure you want to ${action} this hospital?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/toggle-verification`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage(`Hospital ${currentStatus ? 'marked as pending' : 'verified'} successfully`);
                setMessageType('success');
                loadHospitals(); // Reload the list
            } else {
                setMessage('Failed to update hospital verification status');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating hospital verification status');
            setMessageType('error');
            console.error('Toggle verification error:', error);
        }
    };

    const toggleHospitalStatus = async (hospitalId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this hospital?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage(`Hospital ${currentStatus ? 'deactivated' : 'activated'} successfully`);
                setMessageType('success');
                loadHospitals(); // Reload the list
            } else {
                setMessage('Failed to update hospital status');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating hospital status');
            setMessageType('error');
            console.error('Toggle status error:', error);
        }
    };

    const deleteHospital = async (hospitalId, hospitalName) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${hospitalName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage('Hospital deleted successfully');
                setMessageType('success');
                loadHospitals(); // Reload the list
            } else {
                setMessage('Failed to delete hospital');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error deleting hospital');
            setMessageType('error');
            console.error('Delete hospital error:', error);
        }
    };

    const openEditModal = (hospital) => {
        setSelectedHospital(hospital);
        setEditForm({
            hospitalName: hospital.hospitalName || '',
            email: hospital.email || '',
            phone: hospital.phone || '',
            address: hospital.address || '',
            city: hospital.city || '',
            latitude: hospital.latitude || null,
            longitude: hospital.longitude || null,
            contactPerson: hospital.contactPerson || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${selectedHospital.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                setMessage('Hospital updated successfully');
                setMessageType('success');
                setShowEditModal(false);
                loadHospitals(); // Reload the list
            } else {
                setMessage('Failed to update hospital');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating hospital');
            setMessageType('error');
            console.error('Update hospital error:', error);
        }
    };

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             hospital.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             hospital.city?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
                             (filterStatus === 'active' && hospital.isActive) ||
                             (filterStatus === 'inactive' && !hospital.isActive) ||
                             (filterStatus === 'verified' && hospital.isVerified) ||
                             (filterStatus === 'pending' && !hospital.isVerified);

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-hospital-management">
            {/* Admin Navbar */}
            <AdminNavbar />

            {/* Page Content */}
            <div className="container-fluid py-4">
                {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="fas fa-hospital me-2 text-primary"></i>Hospital Management
                    </h2>
                    <p className="text-muted mb-0">Manage verification centers and hospital accounts</p>
                </div>
                <button className="btn btn-primary" onClick={loadHospitals}>
                    <i className="fas fa-sync-alt me-2"></i>Refresh
                </button>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-4`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="display-4 text-primary mb-2">
                                <i className="fas fa-hospital"></i>
                            </div>
                            <h4 className="mb-1">{hospitals.length}</h4>
                            <small className="text-muted">Total Hospitals</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="display-4 text-success mb-2">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h4 className="mb-1">{hospitals.filter(h => h.isActive).length}</h4>
                            <small className="text-muted">Active Centers</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="display-4 text-info mb-2">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h4 className="mb-1">{hospitals.filter(h => h.isVerified).length}</h4>
                            <small className="text-muted">Verified Centers</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="display-4 text-orange mb-2">
                                <i className="fas fa-clock"></i>
                            </div>
                            <h4 className="mb-1">{hospitals.filter(h => !h.isVerified).length}</h4>
                            <small className="text-muted">Pending Verification</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Search Hospitals</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, email, or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Filter by Status</label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Hospitals</option>
                                <option value="active">Active Centers</option>
                                <option value="inactive">Inactive Centers</option>
                                <option value="verified">Verified Centers</option>
                                <option value="pending">Pending Verification</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hospitals Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Hospital Name</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHospitals.length > 0 ? (
                                    filteredHospitals.map(hospital => (
                                        <tr key={hospital.id}>
                                            <td>
                                                <div>
                                                    <strong>{hospital.hospitalName}</strong>
                                                    <br />
                                                    <small className="text-muted">ID: {hospital.id}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <i className="fas fa-envelope text-muted me-1"></i>
                                                    {hospital.email}
                                                    <br />
                                                    <i className="fas fa-phone text-muted me-1"></i>
                                                    {hospital.phone}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                                    {hospital.city}
                                                    {hospital.address && (
                                                        <>
                                                            <br />
                                                            <small className="text-muted">{hospital.address}</small>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${hospital.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                    <i className={`fas fa-${hospital.isActive ? 'check' : 'times'} me-1`}></i>
                                                    {hospital.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${hospital.isVerified ? 'bg-info' : 'bg-warning'}`}>
                                                    <i className={`fas fa-${hospital.isVerified ? 'shield-alt' : 'exclamation-triangle'} me-1`}></i>
                                                    {hospital.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openEditModal(hospital)}
                                                        title="Edit Hospital"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${hospital.isVerified ? 'btn-outline-secondary' : 'btn-outline-info'}`}
                                                        onClick={() => toggleVerificationStatus(hospital.id, hospital.isVerified)}
                                                        title={hospital.isVerified ? 'Mark as Pending' : 'Mark as Verified'}
                                                    >
                                                        <i className={`fas fa-${hospital.isVerified ? 'times-circle' : 'check-circle'}`}></i>
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${hospital.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => toggleHospitalStatus(hospital.id, hospital.isActive)}
                                                        title={hospital.isActive ? 'Deactivate Hospital' : 'Activate Hospital'}
                                                    >
                                                        <i className={`fas fa-${hospital.isActive ? 'ban' : 'check'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteHospital(hospital.id, hospital.hospitalName)}
                                                        title="Delete Hospital"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="fas fa-search fa-2x mb-2"></i>
                                                <p className="mb-0">No hospitals found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Hospital Modal */}
            {showEditModal && selectedHospital && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Hospital: {selectedHospital.hospitalName}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Hospital Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.hospitalName}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone *</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Contact Person</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.contactPerson}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.address}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="Street address"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">City *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.city}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Latitude</label>
                                            <input
                                                type="number"
                                                step="0.000001"
                                                className="form-control"
                                                value={editForm.latitude || ''}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                                                placeholder="Auto-filled"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Longitude</label>
                                            <input
                                                type="number"
                                                step="0.000001"
                                                className="form-control"
                                                value={editForm.longitude || ''}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                                                placeholder="Auto-filled"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Hospital
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div> {/* End container-fluid */}
        </div>
    );
};

export default AdminHospitalManagement;
