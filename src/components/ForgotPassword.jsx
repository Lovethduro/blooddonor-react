import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Enter email, 2: Reset password
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [errors, setErrors] = useState({});

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                // Handle 404 or other errors
                if (response.status === 404) {
                    setMessage('Endpoint not found. Please contact support.');
                    setMessageType('error');
                    setLoading(false);
                    return;
                }
                
                // Try to get error message
                try {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'An error occurred. Please try again.');
                } catch {
                    setMessage(`Error ${response.status}: ${response.statusText}`);
                }
                setMessageType('error');
                setLoading(false);
                return;
            }

            // Parse JSON response
            let data;
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    setMessage('Invalid response from server. Please try again.');
                    setMessageType('error');
                    setLoading(false);
                    return;
                }
            } else {
                setMessage('Empty response from server. Please try again.');
                setMessageType('error');
                setLoading(false);
                return;
            }

            if (data.emailExists) {
                setMessage('Email found! Please enter your new password.');
                setMessageType('success');
                setStep(2);
            } else {
                setMessage(data.message || 'Email not found in our system.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred. Please check your connection and try again.');
            setMessageType('error');
            console.error('Forgot password error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        setErrors({});

        // Validation
        const newErrors = {};
        if (!newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    newPassword
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setMessage('Endpoint not found. Please contact support.');
                    setMessageType('error');
                    setLoading(false);
                    return;
                }
                
                try {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Failed to reset password. Please try again.');
                } catch {
                    setMessage(`Error ${response.status}: ${response.statusText}`);
                }
                setMessageType('error');
                setLoading(false);
                return;
            }

            // Parse JSON response
            const text = await response.text();
            let resetData;
            if (text) {
                try {
                    resetData = JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    setMessage('Invalid response from server. Please try again.');
                    setMessageType('error');
                    setLoading(false);
                    return;
                }
            } else {
                setMessage('Empty response from server. Please try again.');
                setMessageType('error');
                setLoading(false);
                return;
            }

            setMessage('Password reset successfully! Redirecting to login...');
            setMessageType('success');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setMessage('An error occurred. Please check your connection and try again.');
            setMessageType('error');
            console.error('Reset password error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container min-vh-100 d-flex align-items-center justify-content-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card border-0 shadow-lg login-card">
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="login-icon mb-3">
                                        <i className="fas fa-key fa-3x text-primary"></i>
                                    </div>
                                    <h2 className="fw-bold text-dark mb-2">
                                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                                    </h2>
                                    <p className="text-muted">
                                        {step === 1 
                                            ? 'Enter your email address to reset your password'
                                            : 'Enter your new password below'
                                        }
                                    </p>
                                </div>

                                {/* Messages */}
                                {message && (
                                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                                        <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                                        {message}
                                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                                    </div>
                                )}

                                {/* Step 1: Enter Email */}
                                {step === 1 && (
                                    <form onSubmit={handleEmailSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-envelope me-2"></i>Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (errors.email) {
                                                        setErrors({ ...errors, email: '' });
                                                    }
                                                }}
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">{errors.email}</div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg w-100 mb-3"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Checking...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-search me-2"></i>Check Email
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}

                                {/* Step 2: Reset Password */}
                                {step === 2 && (
                                    <form onSubmit={handlePasswordReset}>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-envelope me-2"></i>Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                value={email}
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-lock me-2"></i>New Password
                                            </label>
                                            <input
                                                type="password"
                                                className={`form-control form-control-lg ${errors.newPassword ? 'is-invalid' : ''}`}
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value);
                                                    if (errors.newPassword) {
                                                        setErrors({ ...errors, newPassword: '' });
                                                    }
                                                }}
                                                placeholder="Enter new password"
                                                required
                                                minLength="8"
                                            />
                                            {errors.newPassword && (
                                                <div className="invalid-feedback">{errors.newPassword}</div>
                                            )}
                                            <div className="form-text">
                                                <i className="fas fa-info-circle text-info"></i> Must be at least 8 characters
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-lock me-2"></i>Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    if (errors.confirmPassword) {
                                                        setErrors({ ...errors, confirmPassword: '' });
                                                    }
                                                }}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            {errors.confirmPassword && (
                                                <div className="invalid-feedback">{errors.confirmPassword}</div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg w-100 mb-3"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Resetting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-key me-2"></i>Reset Password
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm w-100"
                                            onClick={() => {
                                                setStep(1);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setMessage('');
                                                setErrors({});
                                            }}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>Back
                                        </button>
                                    </form>
                                )}

                                {/* Back to Login */}
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="fas fa-arrow-left me-2"></i>Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

