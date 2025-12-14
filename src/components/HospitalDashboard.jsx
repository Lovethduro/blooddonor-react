import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalNavbar from './HospitalNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const RecentNotifications = ({ navigate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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
                // Get only the 5 most recent notifications
                setNotifications(data.slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <h5 className="fw-semibold mb-0">
                        <i className="fas fa-bell text-info me-2"></i>Recent Notifications
                    </h5>
                </div>
                <div className="card-body">
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                <h5 className="fw-semibold mb-0">
                    <i className="fas fa-bell text-info me-2"></i>Recent Notifications
                </h5>
                <button className="btn btn-sm btn-outline-primary rounded-pill"
                    onClick={() => navigate('/hospital/notifications')}>
                    View All
                </button>
            </div>
            <div className="card-body">
                {notifications.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="fas fa-bell-slash fa-2x mb-3"></i>
                        <p>No recent notifications</p>
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`list-group-item list-group-item-action border-bottom ${
                                    !notification.isRead ? 'bg-light' : ''
                                }`}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <h6 className="mb-0 me-2">{notification.title}</h6>
                                            {!notification.isRead && (
                                                <span className="badge bg-danger">New</span>
                                            )}
                                            <span className={`badge ${getTypeBadgeClass(notification.type)} ms-2`}>
                                                {notification.type || 'general'}
                                            </span>
                                        </div>
                                        <p className="mb-1 text-muted">{notification.message}</p>
                                        <small className="text-muted">
                                            <i className="fas fa-clock me-1"></i>
                                            {formatDate(notification.createdAt)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const HospitalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        appointmentsCount: 0,
        notificationsCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        loadUserData();
    }, []);

    const loadUserData = () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        setUserData(storedUser);
    };

    const fetchDashboardData = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;

            // Fetch appointments
            const appointmentsResponse = await fetch(`${API_BASE_URL}/auth/hospital/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let appointmentsCount = 0;
            if (appointmentsResponse.ok) {
                const appointments = await appointmentsResponse.json();
                const today = new Date().toISOString().split('T')[0];
                appointmentsCount = appointments.filter(apt => {
                    const aptDate = new Date(apt.date).toISOString().split('T')[0];
                    return aptDate === today;
                }).length;
            }

            // Fetch notifications
            const notificationsResponse = await fetch(`${API_BASE_URL}/auth/hospital/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let notificationsCount = 0;
            if (notificationsResponse.ok) {
                const notifications = await notificationsResponse.json();
                notificationsCount = notifications.length;
            }

            setStats({
                appointmentsCount: appointmentsCount,
                notificationsCount: notificationsCount
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <HospitalNavbar />
                <div className="container-fluid py-5 bg-light min-vh-100">
                    <div className="container">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HospitalNavbar />
            <div className="container my-5">
                {/* Welcome Bar */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">
                            Welcome back, {userData?.name || 'Hospital'}
                        </h2>
                        <p className="text-muted">Here's what's happening with your blood bank today</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar avatar-lg bg-primary bg-opacity-10 text-primary rounded-circle">
                                            <i className="fas fa-calendar-check fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-4">
                                        <h5 className="text-muted mb-1">Today's Appointments</h5>
                                        <h2 className="fw-bold text-primary mb-0">{stats.appointmentsCount}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar avatar-lg bg-info bg-opacity-10 text-info rounded-circle">
                                            <i className="fas fa-bell fa-lg"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-4">
                                        <h5 className="text-muted mb-1">Total Notifications</h5>
                                        <h2 className="fw-bold text-info mb-0">{stats.notificationsCount}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Tools */}
                <h4 className="fw-semibold text-dark mb-4">Management Tools</h4>
                <div className="row g-4 mb-5">
                    <div className="col-md-6 col-lg-3">
                        <div className="card border-0 shadow-sm text-center h-100 hover-lift bg-hover-primary"
                            onClick={() => navigate('/hospital/appointments')} style={{ cursor: 'pointer' }}>
                            <div className="card-body p-4">
                                <i className="fas fa-calendar-plus fa-3x text-primary mb-3"></i>
                                <h5 className="fw-semibold">Appointments</h5>
                                <p className="small text-muted mb-0">Schedule & manage donor visits</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="card border-0 shadow-sm text-center h-100 hover-lift bg-hover-info"
                            onClick={() => navigate('/hospital/notifications')} style={{ cursor: 'pointer' }}>
                            <div className="card-body p-4">
                                <i className="fas fa-bell fa-3x text-info mb-3"></i>
                                <h5 className="fw-semibold">Notifications</h5>
                                <p className="small text-muted mb-0">Send alerts & reminders</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="card border-0 shadow-sm text-center h-100 hover-lift bg-hover-purple"
                            onClick={() => navigate('/hospital/contact-admin')} style={{ cursor: 'pointer' }}>
                            <div className="card-body p-4">
                                <i className="fas fa-headset fa-3x text-purple mb-3"></i>
                                <h5 className="fw-semibold">Contact Admin</h5>
                                <p className="small text-muted mb-0">Get support instantly</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Recent Notifications */}
                <div className="row g-4">
                    {/* Recent Notifications */}
                    <div className="col-lg-12">
                        <RecentNotifications navigate={navigate} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                :root {
                    --primary: #0d6efd;
                    --info: #0dcaf0;
                    --success: #198754;
                    --danger: #dc3545;
                    --purple: #6f42c1;
                }
                .bg-primary { background-color: #0d3b64 !important; }
                .text-purple { color: var(--purple); }
                .hover-lift {
                    transition: all 0.3s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
                .bg-hover-primary:hover { background-color: #0d3b6410 !important; }
                .bg-hover-info:hover { background-color: #0dcaf010 !important; }
                .bg-hover-success:hover { background-color: #19875410 !important; }
                .bg-hover-purple:hover { background-color: #6f42c110 !important; }
                .avatar {
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .card {
                    border-radius: 1rem;
                    overflow: hidden;
                }
                .card-header {
                    background-color: #fff;
                }
            `}</style>
        </>
    );
};

export default HospitalDashboard;