import React, { useState } from 'react';
import HospitalNavbar from './HospitalNavbar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalContactAdmin = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Normal',
        category: 'Technical Support'
    });
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showMessagePanel, setShowMessagePanel] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'message') {
            setCharacterCount(value.length);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            setMessage('Please fill in all required fields');
            setMessageType('error');
            setShowMessagePanel(true);
            return;
        }

        setSending(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/hospital/contact-admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Subject: formData.subject,
                    Message: formData.message,
                    Priority: formData.priority,
                    Category: formData.category
                })
            });

            if (response.ok) {
                setMessage('Message sent to administrators successfully!');
                setMessageType('success');
                setShowMessagePanel(true);

                // Reset form
                setFormData({
                    subject: '',
                    message: '',
                    priority: 'Normal',
                    category: 'Technical Support'
                });
                setCharacterCount(0);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send message');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
            setShowMessagePanel(true);
        } finally {
            setSending(false);
        }
    };

    const closeMessagePanel = () => {
        setShowMessagePanel(false);
        setMessage('');
    };

    return (
        <>
            <HospitalNavbar />

            {/* Message Panel */}
            {showMessagePanel && message && (
                <div className={`message-panel ${messageType}`}>
                    <div className="alert-content">
                        <div>
                            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                            {message}
                        </div>
                        <button type="button" className="alert-close" onClick={closeMessagePanel}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            )}

            <div className="container-fluid py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 className="h2 fw-bold text-primary">
                                    <i className="fas fa-headset me-2"></i>Contact System Administrator
                                </h1>
                                <p className="text-muted">Get support from system administrators</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm contact-card">
                            <div className="card-header bg-info text-white">
                                <h5 className="card-title mb-0">
                                    <i className="fas fa-envelope me-2"></i>Send Message to Administrators
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Subject */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="form-control"
                                            placeholder="Message subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Message *</label>
                                        <textarea
                                            name="message"
                                            className="form-control"
                                            rows="6"
                                            placeholder="Describe your issue or request..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className={`form-text text-end mt-1 small ${characterCount > 1000 ? 'text-danger' : 'text-muted'}`}>
                                            {characterCount} characters {characterCount > 1000 && '(Too long)'}
                                        </div>
                                    </div>

                                    {/* Priority and Category */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Priority</label>
                                            <select
                                                name="priority"
                                                className="form-select"
                                                value={formData.priority}
                                                onChange={handleChange}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Normal">Normal</option>
                                                <option value="High">High</option>
                                                <option value="Urgent">Urgent</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Category</label>
                                            <select
                                                name="category"
                                                className="form-select"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                <option value="Technical Support">Technical Support</option>
                                                <option value="Account Issue">Account Issue</option>
                                                <option value="Feature Request">Feature Request</option>
                                                <option value="Donor Management">Donor Management</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-info w-100 py-2 btn-send"
                                            disabled={sending}
                                        >
                                            {sending ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Sending Message...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane me-2"></i>
                                                    Send Message to Admin
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Message Panel Styles */
                .message-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 9999;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid #0d6efd;
                }

                .message-panel.success {
                    border-left-color: #198754;
                }

                .message-panel.error {
                    border-left-color: #dc3545;
                }

                .alert-content {
                    padding: 1rem 1.25rem;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .alert-close {
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .alert-close:hover {
                    background: #f8f9fa;
                    color: #343a40;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* Contact Card Styles */
                .contact-card {
                    border: none;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .contact-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
                }

                .card-header {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    border: none;
                    padding: 1.5rem 2rem;
                }

                .card-title {
                    font-weight: 600;
                    font-size: 1.4rem;
                    margin: 0;
                }

                .card-body {
                    padding: 2.5rem;
                }

                /* Form Styles */
                .form-label {
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-control, .form-select {
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0.875rem 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #ffffff;
                }

                .form-control:focus, .form-select:focus {
                    border-color: #0d9488;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                    background: #f8fafc;
                }

                textarea.form-control {
                    resize: vertical;
                    min-height: 150px;
                    line-height: 1.6;
                }

                /* Button Styles */
                .btn-send {
                    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 1rem 2rem;
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: white;
                    transition: all 0.3s ease;
                }

                .btn-send:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(13, 148, 136, 0.3);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .card-body {
                        padding: 1.5rem;
                    }

                    .message-panel {
                        left: 20px;
                        right: 20px;
                        max-width: calc(100% - 40px);
                    }
                }
            `}</style>
        </>
    );
};

export default HospitalContactAdmin;
