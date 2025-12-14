import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const DonorNavbar = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const getUserInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'D';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
            <div className="container">
                {/* Brand */}
                <a className="navbar-brand fw-bold" href="#" onClick={() => navigate('/donor/dashboard')} style={{color: '#0d3b64'}}>
                    <i className="fas fa-heartbeat text-danger me-2"></i>Donor Portal
                </a>

                {/* Mobile Toggle */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Donor Navigation */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => navigate('/donor/dashboard')}>
                                <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={() => navigate('/donor/profile')}>
                                <i className="fas fa-user me-1"></i>My Profile
                            </a>
                        </li>
                    </ul>

                    {/* User Profile Area */}
                    <div className="d-flex align-items-center gap-3">
                        {/* User Dropdown with Profile Picture */}
                        <div className="dropdown">
                            <button
                                className="btn btn-link dropdown-toggle d-flex align-items-center text-decoration-none text-dark p-0 border-0 bg-transparent"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {/* Profile Picture Container */}
                                <div className="me-2">
                                    {userData?.profilePicture ? (
                                        <img
                                            src={`${API_BASE_URL.replace('/api', '')}${userData.profilePicture}`}
                                            className="rounded-circle border border-2 border-primary"
                                            style={{width: '36px', height: '36px', objectFit: 'cover'}}
                                            alt="Profile Picture"
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle border border-2 border-primary d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'linear-gradient(135deg, #0d3b64, #1e5799)',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {getUserInitial(userData?.name)}
                                        </div>
                                    )}
                                </div>

                                {/* User Name */}
                                <div className="d-none d-lg-block">
                                    <span className="fw-medium">
                                        {userData?.name || 'Donor'}
                                    </span>
                                </div>
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                                <li>
                                    <h6 className="dropdown-header">
                                        {userData?.email || 'donor@example.com'}
                                    </h6>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <a className="dropdown-item" href="#" onClick={() => navigate('/donor/profile')}>
                                        <i className="fas fa-user me-2"></i>My Profile
                                    </a>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt me-2"></i>Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DonorNavbar;
