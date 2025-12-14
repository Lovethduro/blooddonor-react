import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDefaultAvatarSVG } from './DefaultAvatars';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminNavbar = () => {
    const navigate = useNavigate();
    
    // Get user data from storage
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    
    const handleLogout = () => {
        // Clear authentication token only
        sessionStorage.removeItem('token');
        
        // Keep user data for convenience (remember me functionality)
        // localStorage.setItem('user', JSON.stringify(userData)); // Already stored
        
        // Navigate to login
        navigate('/login');
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
                <div className="container">
                    {/* Brand */}
                    <Link className="navbar-brand fw-bold fs-4" to="/admin/dashboard" style={{color: '#0d3b64'}}>
                        <i className="fas fa-heartbeat text-danger me-2"></i>Blood Connect
                    </Link>

                    {/* Hamburger Menu */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/admin/dashboard">
                                    <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/admin/users">
                                    <i className="fas fa-users me-1"></i> User Management
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/admin/notifications">
                                    <i className="fas fa-bell me-1"></i> Notifications
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link px-3 btn btn-link text-decoration-none p-0" onClick={() => navigate('/admin/hospitals')}>
                                    <i className="fas fa-hospital me-1"></i> Hospital Management
                                </button>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link px-3" to="/admin/appointments">
                                    <i className="fas fa-calendar-check me-1"></i> Appointments
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link px-3 btn btn-link text-decoration-none p-0" onClick={() => navigate('/admin/messages')}>
                                    <i className="fas fa-envelope me-1"></i> Messages
                                </button>
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
                                        <img src={(userData?.profilePicture && userData.profilePicture.trim() !== '') 
                                                ? `${API_BASE_URL.replace('/api', '')}${userData.profilePicture}` 
                                                : getDefaultAvatarSVG('admin')} 
                                             className="rounded-circle border border-2 border-primary"
                                             style={{width: '36px', height: '36px', objectFit: 'cover'}}
                                             alt="Admin Profile" 
                                             onError={(e) => {
                                                 const defaultSrc = getDefaultAvatarSVG('admin');
                                                 if (e.target.src !== defaultSrc) {
                                                     e.target.src = defaultSrc;
                                                 }
                                             }} />
                                    </div>
                                    <span className="ms-2 fw-medium d-none d-md-inline">
                                        {userData?.name || 'Admin'}
                                    </span>
                                </button>
                                
                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <Link className="dropdown-item" to="/admin/profile">
                                            <i className="fas fa-user me-2"></i> My Profile
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt me-2"></i> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AdminNavbar;
