import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api'; // Add this import

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({
        totalDonors: 0,
        totalHospitals: 0,
        pendingVerifications: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        totalNotifications: 0,
        unreadNotifications: 0
    });
    const [loading, setLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState('');
    
    // Get active tab from navigation state or default to overview
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
    const [hospitals, setHospitals] = useState([]);
    const [donors, setDonors] = useState([]);
    const [messages, setMessages] = useState([]);
    const [showCreateDonor, setShowCreateDonor] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        updateDateTime();

        // Update datetime every minute
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Update active tab when location state changes
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const updateDateTime = () => {
        const now = new Date();
        setCurrentDateTime(now.toLocaleString());
    };

    const handleGenerateReport = async (format) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            // Show a modal or prompt for report type selection
            const reportType = window.prompt('Select report type:\n1. all - Comprehensive report\n2. donors - Donors only\n3. hospitals - Hospitals only\n4. appointments - Appointments only', 'all');
            
            if (!reportType) {
                return; // User cancelled
            }

            const endpoint = format === 'pdf' 
                ? `${API_BASE_URL}/admin/reports/pdf?reportType=${reportType}`
                : `${API_BASE_URL}/admin/reports/csv?reportType=${reportType}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            if (format === 'csv') {
                // Download CSV file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // For PDF, get the HTML content and convert to PDF using browser print
                const htmlContent = await response.text();
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = window.URL.createObjectURL(blob);
                
                // Open in a new window
                const newWindow = window.open(url, '_blank');
                
                if (newWindow) {
                    newWindow.onload = () => {
                        // Add a styled header with instructions
                        const instructionsHtml = `
                            <div style="background: linear-gradient(135deg, #0d3b64 0%, #355677 100%); color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 10px 0; font-size: 18px;">
                                    <i class="fas fa-file-pdf" style="margin-right: 8px;"></i>Save as PDF
                                </h3>
                                <p style="margin: 0; font-size: 14px;">
                                    Press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac), then select "Save as PDF" as the destination
                                </p>
                            </div>
                        `;
                        newWindow.document.body.insertAdjacentHTML('afterbegin', instructionsHtml);
                        
                        // Automatically trigger print dialog after a short delay
                        setTimeout(() => {
                            newWindow.print();
                        }, 1000);
                    };
                } else {
                    // Fallback: if popup blocked, download HTML file
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    alert('Popup blocked. HTML file downloaded. Open it and press Ctrl+P to save as PDF.');
                }
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        }
    };

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Dashboard stats from API:', data);
                setStats({
                    totalDonors: data.totalDonors || 0,
                    totalHospitals: data.totalHospitals || 0,
                    pendingVerifications: data.pendingVerifications || 0,
                    totalAppointments: data.totalAppointments || 0,
                    todayAppointments: data.todayAppointments || 0,
                    totalNotifications: data.totalNotifications || 0,
                    unreadNotifications: data.unreadNotifications || 0
                });
                console.log('Stats state updated:', {
                    totalDonors: data.totalDonors || 0,
                    totalHospitals: data.totalHospitals || 0,
                    totalAppointments: data.totalAppointments || 0,
                    todayAppointments: data.todayAppointments || 0
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to fetch dashboard data:', response.status, errorData);
                setStats({
                    totalDonors: 0,
                    totalHospitals: 0,
                    pendingVerifications: 0,
                    totalAppointments: 0,
                    todayAppointments: 0,
                    totalNotifications: 0,
                    unreadNotifications: 0
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({
                totalDonors: 0,
                totalHospitals: 0,
                pendingVerifications: 0,
                totalAppointments: 0,
                todayAppointments: 0,
                totalNotifications: 0,
                unreadNotifications: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <AdminNavbar />
                <div className="container-fluid py-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hospital Management Functions
    const loadHospitals = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHospitals(data);
            }
        } catch (error) {
            console.error('Failed to load hospitals:', error);
        }
    };

    const editHospital = (hospital) => {
        // TODO: Implement hospital editing modal/form
        alert(`Edit hospital: ${hospital.hospitalName}`);
    };

    const toggleHospitalStatus = async (hospitalId, currentStatus) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Reload hospitals to show updated status
                loadHospitals();
            }
        } catch (error) {
            console.error('Failed to toggle hospital status:', error);
        }
    };

    const deleteHospital = async (hospitalId) => {
        if (!window.confirm('Are you sure you want to delete this hospital?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Reload hospitals
                loadHospitals();
            }
        } catch (error) {
            console.error('Failed to delete hospital:', error);
        }
    };

    // Donor Management Functions
    const loadDonors = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/donors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDonors(data);
            }
        } catch (error) {
            console.error('Failed to load donors:', error);
        }
    };

    const editDonor = (donor) => {
        // TODO: Implement donor editing modal/form
        alert(`Edit donor: ${donor.name}`);
    };

    const deleteDonor = async (donorId) => {
        if (!window.confirm('Are you sure you want to delete this donor?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/donors/${donorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Reload donors
                loadDonors();
            }
        } catch (error) {
            console.error('Failed to delete donor:', error);
        }
    };

    // Appointment and Notification Functions
    const createAppointment = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const appointmentData = Object.fromEntries(formData);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                alert('Appointment created successfully!');
                e.target.reset();
            }
        } catch (error) {
            console.error('Failed to create appointment:', error);
        }
    };

    const createNotification = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const notificationData = Object.fromEntries(formData);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });

            if (response.ok) {
                alert('Notification sent successfully!');
                e.target.reset();
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Admin Navbar at the TOP */}
            <AdminNavbar />

            {/* Page Header */}
            <div className="container-fluid py-4 mb-4" 
                 style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col">
                            <h1 className="h2 fw-bold text-white mb-2">
                                <i className="fas fa-heartbeat text-danger me-2"></i>Admin Dashboard
                            </h1>
                            <p className="text-light mb-0 opacity-75">System administration and management portal</p>
                        </div>
                        <div className="col-auto">
                            <div className="text-end">
                                <h5 className="text-white mb-1 fw-bold">Administrator</h5>
                                <small className="text-light opacity-75">{currentDateTime}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                {/* Statistics Overview */}
                <div className="row g-4 mb-5">
                    {/* Total Donors Card */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)'}}>
                                            <i className="fas fa-users text-white fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="fw-bold text-dark mb-0">{stats.totalDonors.toLocaleString()}</h4>
                                        <span className="text-muted small">Total Donors</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="badge bg-success bg-opacity-10 text-success small">
                                        <i className="fas fa-arrow-up me-1"></i>Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Appointments Card */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/appointments')}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                                            <i className="fas fa-calendar-check text-white fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="fw-bold text-dark mb-0">{stats.todayAppointments}</h4>
                                        <span className="text-muted small">Today's Appointments</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="badge bg-warning bg-opacity-10 text-warning small">
                                        <i className="fas fa-clock me-1"></i>Total: {stats.totalAppointments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/notifications')}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                                            <i className="fas fa-bell text-white fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="fw-bold text-dark mb-0">{stats.unreadNotifications}</h4>
                                        <span className="text-muted small">Notifications</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="badge bg-danger bg-opacity-10 text-danger small">
                                        <i className="fas fa-envelope me-1"></i>Total: {stats.totalNotifications}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Hospitals Card */}
                    <div className="col-xl-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/hospitals')}>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
                                            <i className="fas fa-hospital text-white fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="fw-bold text-dark mb-0">{stats.totalHospitals}</h4>
                                        <span className="text-muted small">Verification Centers</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className="badge bg-info bg-opacity-10 text-info small">
                                        <i className="fas fa-check me-1"></i>Pending: {stats.pendingVerifications}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold text-dark mb-0">Quick Actions</h4>
                            <div className="text-muted small">
                                <i className="fas fa-bolt me-1"></i>Administrative Tools
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="row g-4">
                    {/* Appointments Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)'}}>
                                        <i className="fas fa-calendar-check text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">Appointments</h5>
                                <p className="text-muted small mb-4">Manage donor appointments and scheduling</p>
                                <button 
                                    className="btn btn-outline-primary btn-sm rounded-pill px-4"
                                    onClick={() => navigate('/admin/appointments')}
                                >
                                    Manage <i className="fas fa-arrow-right ms-1 small"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* User Management Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                                        <i className="fas fa-users text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">User Management</h5>
                                <p className="text-muted small mb-4">Manage donor accounts and permissions</p>
                                <button 
                                    className="btn btn-outline-success btn-sm rounded-pill px-4"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    Manage <i className="fas fa-arrow-right ms-1 small"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                                        <i className="fas fa-bell text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">Notifications</h5>
                                <p className="text-muted small mb-4">System alerts and announcements</p>
                                <button 
                                    className="btn btn-outline-warning btn-sm rounded-pill px-4"
                                    onClick={() => navigate('/admin/notifications')}
                                >
                                    Manage <i className="fas fa-arrow-right ms-1 small"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                                        <i className="fas fa-envelope text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">Hospital Messages</h5>
                                <p className="text-muted small mb-4">Messages from partner hospitals</p>
                                <button
                                    className="btn btn-outline-success btn-sm rounded-pill px-4"
                                    onClick={() => navigate('/admin/messages')}
                                >
                                    View Messages <i className="fas fa-arrow-right ms-1 small"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hospitals Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
                                        <i className="fas fa-hospital text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">Hospitals</h5>
                                <p className="text-muted small mb-4">Partner hospital management</p>
                                <button 
                                    className="btn btn-outline-info btn-sm rounded-pill px-4"
                                    onClick={() => navigate('/admin/hospitals')}
                                >
                                    Manage <i className="fas fa-arrow-right ms-1 small"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reports Card */}
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 shadow-sm h-100 transition-all">
                            <div className="card-body p-4 text-center">
                                <div className="mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                                        <i className="fas fa-file-alt text-white fa-2x"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold text-dark mb-3">Reports</h5>
                                <p className="text-muted small mb-4">Generate PDF and CSV reports</p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleGenerateReport('pdf')}
                                        title="Generate PDF Report"
                                    >
                                        <i className="fas fa-file-pdf me-1"></i> PDF
                                    </button>
                                    <button 
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => handleGenerateReport('csv')}
                                        title="Generate CSV Report"
                                    >
                                        <i className="fas fa-file-csv me-1"></i> CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="row mt-4">
                    <div className="col-12">
                        {activeTab === 'appointments' && (
                            <div className="card">
                                <div className="card-body">
                                    <h5>Appointments Management</h5>
                                    <p className="text-muted">Appointment management features coming soon...</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'users' && (
                            <div className="card">
                                <div className="card-body">
                                    <h5>Donor Management</h5>
                                    <div className="mb-3">
                                        <button className="btn btn-primary me-2" onClick={loadDonors}>
                                            <i className="fas fa-sync me-1"></i>Load Donors
                                        </button>
                                        <button className="btn btn-success" onClick={() => setShowCreateDonor(true)}>
                                            <i className="fas fa-plus me-1"></i>Add Donor
                                        </button>
                                    </div>
                                    {donors.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Blood Type</th>
                                                        <th>Eligible</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {donors.map(donor => (
                                                        <tr key={donor.id}>
                                                            <td>{donor.name}</td>
                                                            <td>{donor.email}</td>
                                                            <td>{donor.bloodType}</td>
                                                            <td>
                                                                <span className={`badge ${donor.isEligible ? 'bg-success' : 'bg-danger'}`}>
                                                                    {donor.isEligible ? 'Yes' : 'No'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editDonor(donor)}>
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDonor(donor.id)}>
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No donors loaded. Click "Load Donors" to fetch data.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'notifications' && (
                            <div className="card">
                                <div className="card-body">
                                    <h5>Notifications & Appointments Management</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Create Appointment</h6>
                                            <form onSubmit={createAppointment}>
                                                <div className="mb-3">
                                                    <select className="form-select" name="donorId" required>
                                                        <option value="">Select Donor</option>
                                                        {donors.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} ({d.bloodType})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <select className="form-select" name="hospitalId" required>
                                                        <option value="">Select Hospital</option>
                                                        {hospitals.filter(h => h.isActive).map(h => (
                                                            <option key={h.id} value={h.id}>{h.hospitalName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <input type="date" className="form-control" name="date" required />
                                                </div>
                                                <div className="mb-3">
                                                    <input type="time" className="form-control" name="time" required />
                                                </div>
                                                <div className="mb-3">
                                                    <select className="form-select" name="bloodType" required>
                                                        <option value="O+">O+</option>
                                                        <option value="O-">O-</option>
                                                        <option value="A+">A+</option>
                                                        <option value="A-">A-</option>
                                                        <option value="B+">B+</option>
                                                        <option value="B-">B-</option>
                                                        <option value="AB+">AB+</option>
                                                        <option value="AB-">AB-</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="btn btn-primary">Create Appointment</button>
                                            </form>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Send Notification</h6>
                                            <form onSubmit={createNotification}>
                                                <div className="mb-3">
                                                    <input type="text" className="form-control" name="title" placeholder="Notification Title" required />
                                                </div>
                                                <div className="mb-3">
                                                    <textarea className="form-control" name="message" placeholder="Message" rows="3" required></textarea>
                                                </div>
                                                <div className="mb-3">
                                                    <select className="form-select" name="userId" required>
                                                        <option value="">Select Recipient</option>
                                                        {donors.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} (Donor)</option>
                                                        ))}
                                                        {hospitals.map(h => (
                                                            <option key={h.id} value={h.id}>{h.hospitalName} (Hospital)</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <select className="form-select" name="userRole" required>
                                                        <option value="Donor">Donor</option>
                                                        <option value="Hospital">Hospital</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="btn btn-success">Send Notification</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'hospitals' && (
                            <div className="card">
                                <div className="card-body">
                                    <h5>Hospital Management</h5>
                                    <div className="mb-3">
                                        <button className="btn btn-primary me-2" onClick={loadHospitals}>
                                            <i className="fas fa-sync me-1"></i>Load Hospitals
                                        </button>
                                    </div>
                                    {hospitals.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Hospital Name</th>
                                                        <th>Email</th>
                                                        <th>City</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {hospitals.map(hospital => (
                                                        <tr key={hospital.id}>
                                                            <td>{hospital.hospitalName}</td>
                                                            <td>{hospital.email}</td>
                                                            <td>{hospital.city}</td>
                                                            <td>
                                                                <span className={`badge ${hospital.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {hospital.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editHospital(hospital)}>
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-warning me-1" onClick={() => toggleHospitalStatus(hospital.id, hospital.isActive)}>
                                                                    <i className={`fas fa-${hospital.isActive ? 'ban' : 'check'}`}></i>
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteHospital(hospital.id)}>
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No hospitals loaded. Click "Load Hospitals" to fetch data.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer at the bottom of the page */}
            <footer className="bg-white border-top py-4 mt-auto">
                <div className="container text-center text-muted">
                    <p className="mb-0">
                        &copy; {new Date().getFullYear()} Blood Connect — 
                        <strong>Administrative System</strong>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdminDashboard;
