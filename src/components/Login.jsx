// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

// Base API URL - adjust based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Pre-fill form with stored user data if remember me was used
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        if (storedUser && storedUser.email) {
            setFormData(prev => ({
                ...prev,
                email: storedUser.email,
                rememberMe: localStorage.getItem('user') !== null // If stored in localStorage, remember me was checked
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        if (loginError) setLoginError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setLoginError('');

        try {
            // Real API call to backend
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: formData.rememberMe
                }),
                credentials: 'include' // Important for cookies (Remember Me feature)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success) {
                // Clear any existing mock data first
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');
                
                // Store user data
                const userData = {
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    token: data.token,
                    ...data.user // Include all user-specific data
                };

                console.log('=== STORING REAL DATA ===');
                console.log('userData:', userData);
                console.log('token:', data.token);

                // Store based on rememberMe preference
                if (formData.rememberMe) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    console.log('Stored in localStorage');
                } else {
                    sessionStorage.setItem('user', JSON.stringify(userData));
                    console.log('Stored in sessionStorage');
                }

                // Store token in memory for API calls
                sessionStorage.setItem('token', data.token);

                // Verify what was actually stored
                const storedUser = formData.rememberMe ? 
                    JSON.parse(localStorage.getItem('user') || 'null') :
                    JSON.parse(sessionStorage.getItem('user') || 'null');
                console.log('Verification - stored user:', storedUser);
                console.log('Verification - stored token:', sessionStorage.getItem('token'));

                // Redirect based on role
                console.log('Login successful, user data:', data.user);
                console.log('User role:', data.user.role);
                
                switch (data.user.role.toLowerCase()) {
                    case 'admin':
                    case 'superadmin':
                        console.log('Redirecting to admin dashboard...');
                        navigate('/admin/dashboard');
                        break;
                    case 'hospital':
                        console.log('Redirecting to hospital dashboard...');
                        navigate('/hospital/dashboard');
                        break;
                    case 'donor':
                        console.log('Redirecting to donor dashboard...');
                        navigate('/donor/dashboard');
                        break;
                    default:
                        console.log('Unknown role, redirecting to home...');
                        navigate('/');
                        break;
                }
            } else {
                setLoginError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-lg-5 col-md-6 col-sm-8">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="logo mb-3">
                                        <i className="fas fa-heartbeat text-danger" style={{fontSize: '3rem'}}></i>
                                    </div>
                                    <h2 className="fw-bold text-primary mb-2">Welcome Back</h2>
                                    <p className="text-muted">Sign in to your Blood Donor account</p>
                                </div>

                                {/* Error Message */}
                                {loginError && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {loginError}
                                        <button type="button" className="btn-close" onClick={() => setLoginError('')}></button>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label fw-bold">
                                            Email Address <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-envelope text-muted"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                                                id="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="text-danger small mt-1">{errors.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label fw-bold">
                                            Password <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                                                id="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary border-start-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div className="text-danger small mt-1">{errors.password}</div>
                                        )}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="rememberMe"
                                                name="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <label className="form-check-label form-label-primary" htmlFor="rememberMe">
                                                Remember me
                                            </label>
                                        </div>
                                        <Link to="/forgot-password" className="text-decoration-none small">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3 fw-bold mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </button>

                                    {/* Register Links */}
                                    <div className="text-center">
                                        <p className="mb-2 text-muted">Don't have an account?</p>
                                        <div className="d-grid gap-2">
                                            <Link to="/donor-register" className="btn btn-outline-primary">
                                                <i className="fas fa-user-plus me-2"></i>Register as Donor
                                            </Link>
                                            <Link to="/hospital-register" className="btn btn-outline-success">
                                                <i className="fas fa-hospital me-2"></i>Register as Hospital
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                © 2025 Blood Connect — Administrative System
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;