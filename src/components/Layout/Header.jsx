// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const closeDropdown = () => setIsDropdownOpen(false);

    const handleDropdownClick = () => {
        setIsNavCollapsed(true);
        closeDropdown();
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold" to="/" style={{ color: '#0d3b64' }}>
                    <i className="fas fa-heartbeat text-danger me-2"></i>Blood Connect
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={handleNavCollapse}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Public Navigation */}
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/" onClick={handleDropdownClick}>
                                <i className="fas fa-home me-1"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about" onClick={handleDropdownClick}>
                                <i className="fas fa-info-circle me-1"></i>About
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact" onClick={handleDropdownClick}>
                                <i className="fas fa-envelope me-1"></i>Contact
                            </Link>
                        </li>
                    </ul>

                    {/* Login/Signup Buttons */}
                    <div className="d-flex align-items-center gap-2">
                        <Link
                            className="btn btn-outline-primary btn-sm"
                            to="/login"
                            onClick={handleDropdownClick}
                        >
                            <i className="fas fa-sign-in-alt me-1"></i>Login
                        </Link>

                        {/* Register Dropdown */}
                        <div className="dropdown">
                            <button
                                className="btn btn-danger btn-sm dropdown-toggle"
                                type="button"
                                onClick={toggleDropdown}
                                style={{
                                    background: 'linear-gradient(45deg, #e74c3c, #ff6b6b)',
                                    border: 'none'
                                }}
                            >
                                <i className="fas fa-user-plus me-1"></i>Register
                            </button>
                            <ul
                                className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}
                                style={{ position: 'absolute' }}
                            >
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/register"
                                        onClick={handleDropdownClick}
                                    >
                                        <i className="fas fa-user me-2 text-danger"></i>As Donor
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/hospital-register"
                                        onClick={handleDropdownClick}
                                    >
                                        <i className="fas fa-hospital me-2"></i>As Hospital
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;