// src/components/Contact.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactType: 'general',
        subscribeNewsletter: true
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        else if (formData.message.length < 20) newErrors.message = 'Message must be at least 20 characters';
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
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
            const response = await fetch(`${API_BASE_URL}/auth/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    subject: formData.subject,
                    message: formData.message,
                    type: formData.contactType
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Thank you for contacting us! We will get back to you within 24 hours.');

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                    contactType: 'general',
                    subscribeNewsletter: true
                });
            } else {
                setErrorMessage(data.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
            console.error('Contact form error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Contact reasons
    const contactReasons = [
        { value: 'general', label: 'General Inquiry', icon: 'fa-question-circle' },
        { value: 'donation', label: 'Blood Donation', icon: 'fa-heartbeat' },
        { value: 'emergency', label: 'Urgent Blood Need', icon: 'fa-exclamation-triangle' },
        { value: 'technical', label: 'Technical Support', icon: 'fa-life-ring' },
        { value: 'feedback', label: 'Feedback/Suggestion', icon: 'fa-comment-dots' },
        { value: 'partnership', label: 'Partnership', icon: 'fa-handshake' }
    ];

    // Contact information
    const contactInfo = [
        {
            icon: 'fa-phone',
            title: 'Emergency Hotline',
            details: ['24/7 Blood Emergency: 1-800-BLOOD-NOW', 'General Inquiries: 1-800-DONATE-4'],
            color: 'danger'
        },
        {
            icon: 'fa-envelope',
            title: 'Email Us',
            details: ['Urgent: emergency@bloodbank.org', 'General: info@bloodbank.org', 'Support: help@bloodbank.org'],
            color: 'primary'
        },
        {
            icon: 'fa-map-marker-alt',
            title: 'Visit Us',
            details: ['123 Life Saving Avenue', 'Medical District, City 12345', 'Open: Mon-Fri 8AM-8PM, Sat 9AM-4PM'],
            color: 'success'
        }
    ];

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero-section text-center py-5 text-white">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h1 className="hero-title fw-bold mb-3 display-5">
                                <i className="fas fa-comments me-3"></i>Contact Us
                            </h1>
                            <p className="hero-subtitle lead fs-5 mb-4 opacity-75">
                                Have questions? Need assistance? We're here to help you save lives
                            </p>
                            <div className="badge bg-light text-primary px-4 py-2 rounded-pill fs-6">
                                <i className="fas fa-clock me-2"></i>24/7 Emergency Support Available
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="container my-5">
                <div className="row g-4 mb-5">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="col-md-4">
                            <div className={`contact-info-card p-4 rounded-3 text-white bg-${info.color} border-0 shadow h-100`}>
                                <div className="contact-icon mb-3">
                                    <i className={`fas ${info.icon} fa-3x`}></i>
                                </div>
                                <h4 className="fw-bold mb-3">{info.title}</h4>
                                {info.details.map((detail, idx) => (
                                    <p key={idx} className="mb-2 opacity-90">
                                        <i className="fas fa-circle fa-xs me-2"></i>{detail}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row">
                    {/* Contact Form */}
                    <div className="col-lg-8 mb-4 mb-lg-0">
                        <div className="card border-0 shadow-lg contact-form-card">
                            <div className="card-header text-white text-center py-4 contact-card-header">
                                <h3 className="fw-bold mb-0">
                                    <i className="fas fa-paper-plane me-2"></i>Send Us a Message
                                </h3>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {/* Emergency Notice */}
                                <div className="alert alert-warning border-0 mb-4 d-flex align-items-center">
                                    <i className="fas fa-exclamation-circle fa-2x me-3 text-warning"></i>
                                    <div>
                                        <strong className="d-block mb-1">For Urgent Blood Needs:</strong>
                                        <small className="mb-0">Call our 24/7 hotline: <strong>1-800-BLOOD-NOW</strong> for immediate assistance</small>
                                    </div>
                                </div>

                                {successMessage && (
                                    <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {successMessage}
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errorMessage}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        {/* Name */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-user me-2"></i>Full Name <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-id-card text-muted"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className={`form-control form-control-lg border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                                                    placeholder="Your full name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <div className="text-danger small mt-1">{errors.name}</div>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-envelope me-2"></i>Email Address <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-at text-muted"></i>
                                                </span>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className={`form-control form-control-lg border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                                                    placeholder="your.email@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="text-danger small mt-1">{errors.email}</div>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-phone me-2"></i>Phone Number
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-mobile-alt text-muted"></i>
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="form-control form-control-lg border-start-0"
                                                    placeholder="+1 (555) 123-4567"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Type */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-tag me-2"></i>Reason for Contact
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-list-alt text-muted"></i>
                                                </span>
                                                <select
                                                    name="contactType"
                                                    className="form-select form-select-lg border-start-0"
                                                    value={formData.contactType}
                                                    onChange={handleChange}
                                                >
                                                    {contactReasons.map((reason) => (
                                                        <option key={reason.value} value={reason.value}>
                                                            {reason.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-heading me-2"></i>Subject <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-pen text-muted"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    className={`form-control form-control-lg border-start-0 ${errors.subject ? 'is-invalid' : ''}`}
                                                    placeholder="Brief summary of your message"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            {errors.subject && (
                                                <div className="text-danger small mt-1">{errors.subject}</div>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div className="col-12">
                                            <label className="form-label fw-bold form-label-primary">
                                                <i className="fas fa-comment-dots me-2"></i>Message <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                                                    <i className="fas fa-edit text-muted"></i>
                                                </span>
                                                <textarea
                                                    name="message"
                                                    className={`form-control border-start-0 ${errors.message ? 'is-invalid' : ''}`}
                                                    rows="5"
                                                    placeholder="Please provide detailed information about your inquiry..."
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                            </div>
                                            {errors.message && (
                                                <div className="text-danger small mt-1">{errors.message}</div>
                                            )}
                                            <div className="form-text mt-2">
                                                <i className="fas fa-info-circle text-info me-1"></i> Minimum 20 characters
                                            </div>
                                        </div>

                                        {/* Newsletter Subscription */}
                                        <div className="col-12">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    name="subscribeNewsletter"
                                                    id="subscribeNewsletter"
                                                    className="form-check-input"
                                                    checked={formData.subscribeNewsletter}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-medium" htmlFor="subscribeNewsletter">
                                                    <i className="fas fa-newspaper me-2 text-primary"></i>
                                                    Subscribe to our newsletter for updates on blood drives and urgent needs
                                                </label>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="col-12 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 py-3 fw-bold contact-submit-btn"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Sending Message...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-2"></i>Send Message
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* FAQ & Additional Info */}
                    <div className="col-lg-4">
                        {/* FAQ */}
                        <div className="card border-0 shadow-lg mb-4 faq-card">
                            <div className="card-header text-white text-center py-3 faq-card-header">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-question-circle me-2"></i>Quick FAQ
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="accordion" id="contactFAQ">
                                    {[
                                        {
                                            id: 'faq1',
                                            question: 'How quickly will I get a response?',
                                            answer: 'We respond to all inquiries within 24 hours. Emergency contacts receive immediate attention.'
                                        },
                                        {
                                            id: 'faq2',
                                            question: 'Can I donate blood immediately?',
                                            answer: 'Yes! Visit our registration page or call our hotline to schedule same-day donation if eligible.'
                                        },
                                        {
                                            id: 'faq3',
                                            question: 'Are there any fees involved?',
                                            answer: 'Blood donation is completely free. We never charge donors or recipients for this life-saving service.'
                                        },
                                        {
                                            id: 'faq4',
                                            question: 'What are your operating hours?',
                                            answer: 'Our centers operate 24/7 for emergencies. Administrative offices are open Mon-Fri 8AM-8PM.'
                                        }
                                    ].map((faq, index) => (
                                        <div key={faq.id} className="accordion-item border-0 mb-2">
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button collapsed fw-medium"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#${faq.id}`}
                                                >
                                                    <i className="fas fa-question-circle me-2 text-info"></i>
                                                    {faq.question}
                                                </button>
                                            </h2>
                                            <div
                                                id={faq.id}
                                                className="accordion-collapse collapse"
                                                data-bs-parent="#contactFAQ"
                                            >
                                                <div className="accordion-body">
                                                    <i className="fas fa-arrow-right text-success me-2"></i>
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="card border-0 shadow-lg emergency-contacts-card">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-center mb-4">
                                    <i className="fas fa-phone-alt text-danger me-2"></i>Emergency Contacts
                                </h5>
                                <div className="list-group border-0">
                                    <a href="tel:1-800-BLOOD-NOW" className="list-group-item list-group-item-action border-0 mb-2 bg-danger text-white">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-ambulance fa-lg me-3"></i>
                                            <div>
                                                <strong className="d-block">24/7 Blood Emergency</strong>
                                                <small>1-800-BLOOD-NOW</small>
                                            </div>
                                        </div>
                                    </a>
                                    <a href="tel:911" className="list-group-item list-group-item-action border-0 mb-2 bg-warning">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-plus-square fa-lg me-3"></i>
                                            <div>
                                                <strong className="d-block">Medical Emergency</strong>
                                                <small>911 or Local EMS</small>
                                            </div>
                                        </div>
                                    </a>
                                    <a href="tel:1-800-DONATE-4" className="list-group-item list-group-item-action border-0 bg-info text-white">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-heart fa-lg me-3"></i>
                                            <div>
                                                <strong className="d-block">Donation Inquiries</strong>
                                                <small>1-800-DONATE-4</small>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;