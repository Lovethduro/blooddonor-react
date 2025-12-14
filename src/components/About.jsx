// src/components/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8 mx-auto text-center text-white">
                            <h1 className="display-4 fw-bold mb-4">About Blood Connect</h1>
                            <p className="lead fs-4 mb-4">Connecting Compassionate Donors with Life-Saving Opportunities</p>
                            <div className="hero-stats row mt-5">
                                <div className="col-md-4">
                                    <div className="stat-item">
                                        <h3 className="fw-bold text-warning">10,000+</h3>
                                        <p className="mb-0">Lives Saved</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="stat-item">
                                        <h3 className="fw-bold text-warning">5,000+</h3>
                                        <p className="mb-0">Active Donors</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="stat-item">
                                        <h3 className="fw-bold text-warning">50+</h3>
                                        <p className="mb-0">Partner Hospitals</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="mission-content">
                                <span className="badge bg-primary rounded-pill px-3 py-2 mb-3">Our Mission</span>
                                <h2 className="fw-bold mb-4">Saving Lives Through Technology & Community</h2>
                                <p className="fs-5 text-muted mb-4">
                                    We bridge the gap between blood donors and patients in need by creating a seamless,
                                    efficient platform that makes life-saving donations accessible to everyone.
                                </p>
                                <div className="mission-points">
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                                        <span className="fs-6">Increase blood availability through smart technology</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                                        <span className="fs-6">Empower donors with easy scheduling and tracking</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-check-circle text-success me-3 fs-5"></i>
                                        <span className="fs-6">Ensure timely responses to emergency needs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="mission-image text-center">
                                <div className="image-placeholder rounded-3 shadow-lg p-5 bg-light">
                                    <i className="fas fa-hand-holding-heart text-danger mission-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="badge bg-primary rounded-pill px-3 py-2 mb-3">How It Works</span>
                        <h2 className="fw-bold mb-4">Simple Process, Maximum Impact</h2>
                        <p className="lead text-muted">Join thousands of heroes in our life-saving community</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="process-card text-center p-4 bg-white rounded-3 shadow-sm h-100">
                                <div className="process-icon mb-4">
                                    <div className="icon-circle mx-auto d-flex align-items-center justify-content-center process-step-1">
                                        <i className="fas fa-user-plus fa-2x text-white"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">1. Register & Profile</h5>
                                <p className="text-muted">Create your donor profile with blood type and availability. Quick, secure, and confidential.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="process-card text-center p-4 bg-white rounded-3 shadow-sm h-100">
                                <div className="process-icon mb-4">
                                    <div className="icon-circle mx-auto d-flex align-items-center justify-content-center process-step-2">
                                        <i className="fas fa-calendar-check fa-2x text-white"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">2. Schedule & Donate</h5>
                                <p className="text-muted">Book appointments at nearby centers. Track your donation history and impact.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="process-card text-center p-4 bg-white rounded-3 shadow-sm h-100">
                                <div className="process-icon mb-4">
                                    <div className="icon-circle mx-auto d-flex align-items-center justify-content-center process-step-3">
                                        <i className="fas fa-bell fa-2x text-white"></i>
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-3">3. Save Lives</h5>
                                <p className="text-muted">Receive targeted notifications when your blood type is urgently needed. Be a hero when it matters most.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Privacy Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="privacy-image text-center">
                                <div className="image-placeholder rounded-3 shadow-lg p-5 bg-light">
                                    <i className="fas fa-shield-alt text-primary privacy-icon"></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="privacy-content">
                                <span className="badge bg-primary rounded-pill px-3 py-2 mb-3">Data Security</span>
                                <h2 className="fw-bold mb-4">Your Privacy & Security Matters</h2>
                                <p className="fs-5 text-muted mb-4">
                                    We implement enterprise-grade security measures to protect your personal information
                                    and ensure complete confidentiality.
                                </p>

                                <div className="security-features">
                                    <div className="d-flex align-items-start mb-4">
                                        <div className="feature-icon me-4">
                                            <i className="fas fa-lock text-success fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold">End-to-End Encryption</h5>
                                            <p className="text-muted mb-0">All sensitive data is encrypted using industry-standard protocols.</p>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-start mb-4">
                                        <div className="feature-icon me-4">
                                            <i className="fas fa-user-shield text-info fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold">Minimal Data Collection</h5>
                                            <p className="text-muted mb-0">We only store information essential for coordinating donations.</p>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-start mb-4">
                                        <div className="feature-icon me-4">
                                            <i className="fas fa-fingerprint text-warning fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold">Secure Authentication</h5>
                                            <p className="text-muted mb-0">Password credentials are securely hashed and never stored in plain text.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5 bg-primary text-white">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto text-center">
                            <h2 className="fw-bold mb-4">Ready to Make a Difference?</h2>
                            <p className="lead mb-4">Join our community of life-savers today. Your one hour can save three lives.</p>
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                <Link
                                    to="/register"
                                    className="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold shadow"
                                >
                                    <i className="fas fa-user-plus me-2"></i>Become a Donor
                                </Link>
                                <Link
                                    to="/"
                                    className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold"
                                >
                                    <i className="fas fa-play-circle me-2"></i>Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;