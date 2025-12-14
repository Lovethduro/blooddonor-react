import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalNavbar = () => {
    const navigate = useNavigate();

    // Get user data from storage
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');

    const handleLogout = () => {
        // Clear authentication token only
        sessionStorage.removeItem('token');

        // Keep user data for convenience (remember me functionality)

        // Navigate to login
        navigate('/login');
    };

    return (
        <>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
                <div className="container">
                    {/* Brand */}
                    <Link className="navbar-brand fw-bold fs-4" to="/hospital/dashboard" style={{ color: '#0d3b64' }}>
                        <i className="fas fa-heartbeat text-danger me-2"></i>Blood Connect
                    </Link>

                    {/* Mobile Toggle */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navbar Links */}
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/hospital/dashboard">
                                    <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/hospital/notifications">
                                    <i className="fas fa-bell me-1"></i> Notifications
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/hospital/appointments">
                                    <i className="fas fa-calendar-check me-1"></i> Appointments
                                </Link>
                            </li>
                        </ul>

                        {/* Right Side: Profile + Logout */}
                        <div className="d-flex align-items-center gap-3">
                            {/* User Dropdown */}
                            <div className="dropdown">
                                <button className="btn btn-link dropdown-toggle d-flex align-items-center text-decoration-none text-dark p-0 border-0 bg-transparent"
                                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {/* Profile Picture */}
                                    <div className="position-relative">
                                        <img src={userData?.profilePicture ? `${API_BASE_URL.replace('/api', '')}${userData.profilePicture}` : '/Images/hospital-avatar.png'}
                                            className="rounded-circle border border-2 border-primary"
                                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                            alt="Hospital Profile"
                                            onError={(e) => {
                                                e.target.src = '/Images/default-avatar.png';
                                                e.target.onError = null;
                                            }} />
                                    </div>
                                    <span className="ms-2 fw-medium d-none d-md-inline">
                                        {userData?.name || 'Hospital User'}
                                    </span>
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <h6 className="dropdown-header">{userData?.email || ''}</h6>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <Link className="dropdown-item" to="/hospital/profile">
                                            <i className="fas fa-building me-2"></i>Hospital Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/change-password')}>
                                            <i className="fas fa-key me-2"></i>Change Password
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt me-2"></i> Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Prominent Logout Button */}
                            <button
                                className="btn btn-outline-danger btn-sm rounded-pill px-3 d-none d-lg-flex align-items-center gap-2"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span className="d-none d-xl-inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default HospitalNavbar;