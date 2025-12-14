import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const token = sessionStorage.getItem('token');
            
            // Load all users (donors and hospitals)
            const [donorsResponse, hospitalsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/donors`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/admin/hospitals`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const donors = donorsResponse.ok ? await donorsResponse.json() : [];
            const hospitals = hospitalsResponse.ok ? await hospitalsResponse.json() : [];

            // Combine and format users
            const allUsers = [
                ...donors.map(d => ({ ...d, role: 'Donor', userType: 'donor' })),
                ...hospitals.map(h => ({ ...h, role: 'Hospital', userType: 'hospital', name: h.hospitalName || h.name }))
            ];

            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            setMessage('Failed to load users');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setMessage('Authentication required');
                setMessageType('error');
                return;
            }
            
            // Use dedicated toggle endpoint for donors and hospitals
            const endpoint = user.userType === 'donor' 
                ? `${API_BASE_URL}/admin/donors/${user.id}/toggle-status`
                : `${API_BASE_URL}/admin/hospitals/${user.id}/toggle-status`;

            console.log('Toggling status for:', user.name, 'Current status:', user.isActive, 'Endpoint:', endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Toggle response:', response.status, data);

            if (response.ok) {
                setMessage(data.message || `User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
                setMessageType('success');
                // Reload users to get updated status
                await loadUsers();
            } else {
                setMessage(data.message || 'Failed to update user status');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating user status: ' + error.message);
            setMessageType('error');
            console.error('Toggle status error:', error);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const endpoint = user.userType === 'donor'
                ? `${API_BASE_URL}/admin/donors/${user.id}`
                : `${API_BASE_URL}/admin/hospitals/${user.id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMessage('User deleted successfully!');
                setMessageType('success');
                await loadUsers();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to delete user');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error deleting user');
            setMessageType('error');
            console.error('Delete user error:', error);
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const endpoint = editingUser.userType === 'donor'
                ? `${API_BASE_URL}/admin/donors/${editingUser.id}`
                : `${API_BASE_URL}/admin/hospitals/${editingUser.id}`;

            const updateData = editingUser.userType === 'donor' ? {
                Name: editingUser.name,
                Email: editingUser.email,
                Phone: editingUser.phone,
                IsActive: editingUser.isActive
            } : {
                HospitalName: editingUser.hospitalName || editingUser.name,
                Email: editingUser.email,
                PhoneNumber: editingUser.phoneNumber || editingUser.phone,
                ContactPerson: editingUser.contactPerson,
                IsActive: editingUser.isActive
            };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setMessage('User updated successfully!');
                setMessageType('success');
                setShowEditModal(false);
                setEditingUser(null);
                await loadUsers();
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to update user');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Error updating user');
            setMessageType('error');
            console.error('Update user error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingUser(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && user.isActive) ||
            (filterStatus === 'inactive' && !user.isActive);
        const matchesSearch = searchTerm === '' ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesStatus && matchesSearch;
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
                        <i className="fas fa-users me-2"></i>User Management
                    </h2>
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
                                <label className="form-label fw-bold">Filter by Role</label>
                                <select
                                    className="form-select"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="Donor">Donor</option>
                                    <option value="Hospital">Hospital</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Filter by Status</label>
                                <select
                                    className="form-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="fw-bold">{user.name || 'N/A'}</div>
                                                    {user.userType === 'hospital' && user.contactPerson && (
                                                        <small className="text-muted">Contact: {user.contactPerson}</small>
                                                    )}
                                                </td>
                                                <td>{user.email || 'N/A'}</td>
                                                <td>{user.phone || user.phoneNumber || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'Donor' ? 'bg-primary' : 'bg-info'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(user)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className={`btn ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            onClick={() => handleToggleStatus(user)}
                                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(user)}
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
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingUser(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    {editingUser.userType === 'donor' ? (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={editingUser.name || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={editingUser.email || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Phone *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phone"
                                                    value={editingUser.phone || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Hospital Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="hospitalName"
                                                    value={editingUser.hospitalName || editingUser.name || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={editingUser.email || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phoneNumber"
                                                    value={editingUser.phoneNumber || editingUser.phone || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Contact Person *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="contactPerson"
                                                    value={editingUser.contactPerson || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="isActive"
                                                checked={editingUser.isActive || false}
                                                onChange={handleInputChange}
                                                id="isActiveCheck"
                                            />
                                            <label className="form-check-label" htmlFor="isActiveCheck">
                                                Active Account
                                            </label>
                                        </div>
                                        <small className="text-muted">
                                            {editingUser.userType === 'donor' 
                                                ? 'Inactive donors cannot log in to their accounts.'
                                                : 'Inactive hospitals cannot access the system.'}
                                        </small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingUser(null);
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

export default AdminUserManagement;

