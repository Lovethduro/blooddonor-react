// src/components/Registration.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Registration.css';

const Registration = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        bloodType: '',
        gender: '',

        // Address Information
        address: '',
        city: '',
        state: '',
        zipCode: '',

        // Appointment Information
        hospitalId: '',
        appointmentDate: '',
        timeSlot: '',
        appointmentNotes: '',

        // Account Security
        password: '',
        confirmPassword: '',

        // Preferences
        wantsNotifications: true,
        acceptedTerms: false,

        // Profile Image
        profileImage: null,
        profilePreview: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Mock hospitals data
    const hospitals = [
        { id: 1, name: 'City General Hospital', address: '123 Medical Center Dr' },
        { id: 2, name: 'University Medical Center', address: '456 Health St' },
        { id: 3, name: 'Community Blood Center', address: '789 Life Ave' }
    ];

    // Mock time slots
    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
    ];

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData({
                        ...formData,
                        profileImage: file,
                        profilePreview: reader.result
                    });
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Validate current step
    const validateStep = () => {
        const newErrors = {};

        switch (currentStep) {
            case 1: // Personal Information
                if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
                if (!formData.email.trim()) newErrors.email = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
                if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
                if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
                if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
                if (!formData.gender) newErrors.gender = 'Gender is required';
                break;

            case 2: // Address Information
                if (!formData.city.trim()) newErrors.city = 'City is required';
                if (!formData.state.trim()) newErrors.state = 'State is required';
                break;

            case 3: // Appointment Information
                if (!formData.hospitalId) newErrors.hospitalId = 'Please select a verification center';
                if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
                if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
                break;

            case 4: // Account Security
                if (!formData.password) newErrors.password = 'Password is required';
                else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
                if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
                else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
                if (!formData.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms and conditions';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNextStep = () => {
        if (validateStep()) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    // Handle previous step
    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep()) {
            setErrorMessage('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // TODO: Replace with actual API call
            const response = await mockApiCall(formData);

            if (response.success) {
                setSuccessMessage('Registration successful! Redirecting to dashboard...');

                // Store user data in localStorage (temporary)
                localStorage.setItem('user', JSON.stringify({
                    email: formData.email,
                    name: formData.fullName,
                    role: 'donor'
                }));

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setErrorMessage(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock API call
    const mockApiCall = (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Registration successful',
                    user: {
                        id: Math.random().toString(36).substr(2, 9),
                        ...data
                    }
                });
            }, 1500);
        });
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    // Calculate minimum date (18 years old)
    const getMinDate = () => {
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return minDate.toISOString().split('T')[0];
    };

    // Calculate maximum appointment date (3 months from now)
    const getMaxAppointmentDate = () => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
        return maxDate.toISOString().split('T')[0];
    };

    // Default appointment date (3 days from now)
    const getDefaultAppointmentDate = () => {
        const today = new Date();
        const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
        return defaultDate.toISOString().split('T')[0];
    };

    return (
        <div className="registration-page">
            {/* Hero Section */}
            <section className="hero-section text-center py-5 text-white">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h1 className="hero-title fw-bold mb-3 display-5">Join the Life-Saving Team!</h1>
                            <p className="hero-subtitle lead fs-5 mb-4 opacity-75">Complete your hero profile and schedule your first donation</p>
                            <div className="badge bg-light text-primary px-4 py-2 rounded-pill fs-6">
                                <i className="fas fa-heartbeat me-2"></i>Every donation saves up to 3 lives
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-lg overflow-hidden registration-card">
                            <div className="card-header text-white text-center py-4 card-header-wave">
                                <div className="position-relative">
                                    <h3 className="fw-bold mb-2"><i className="fas fa-user-plus me-2"></i>Create Your Donor Profile</h3>
                                    <p className="mb-0 opacity-75">Complete all sections to become a verified blood donor</p>
                                </div>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {/* Success/Error Messages */}
                                {successMessage && (
                                    <div className="alert alert-success d-flex align-items-center" role="alert">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {successMessage}
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Progress Indicator */}
                                <div className="progress-indicator mb-5">
                                    <div className="d-flex justify-content-between position-relative">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`step text-center ${currentStep >= step ? 'active' : ''}`}
                                            >
                                                <div className="step-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 position-relative">
                                                    {step}
                                                    <div className="step-circle-border"></div>
                                                </div>
                                                <small className={`fw-bold step-label ${currentStep >= step ? 'text-primary' : 'text-muted'}`}>
                                                    {step === 1 && 'Personal Info'}
                                                    {step === 2 && 'Address Info'}
                                                    {step === 3 && 'Schedule'}
                                                    {step === 4 && 'Complete'}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Step 1: Personal Information */}
                                    {currentStep === 1 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-user-circle me-2"></i>Personal Information
                                                </h4>
                                                <p className="text-muted mb-0">Tell us about yourself</p>
                                            </div>

                                            <div className="row g-3">
                                                {/* Full Name */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Full Name <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-user text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            className={`form-control form-control-lg border-start-0 ${errors.fullName ? 'is-invalid' : ''}`}
                                                            placeholder="Enter your full name"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.fullName && (
                                                        <div className="text-danger small mt-1">{errors.fullName}</div>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Email Address <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-envelope text-muted"></i>
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
                                                        Phone Number <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-phone text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            className={`form-control form-control-lg border-start-0 ${errors.phone ? 'is-invalid' : ''}`}
                                                            placeholder="+1 (555) 123-4567"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.phone && (
                                                        <div className="text-danger small mt-1">{errors.phone}</div>
                                                    )}
                                                </div>

                                                {/* Date of Birth */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Date of Birth <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-calendar text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="date"
                                                            name="dateOfBirth"
                                                            className={`form-control form-control-lg border-start-0 ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                                            max={getMinDate()}
                                                            value={formData.dateOfBirth}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.dateOfBirth && (
                                                        <div className="text-danger small mt-1">{errors.dateOfBirth}</div>
                                                    )}
                                                </div>

                                                {/* Blood Type */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Blood Type <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-tint text-danger"></i>
                                                        </span>
                                                        <select
                                                            name="bloodType"
                                                            className={`form-select form-select-lg border-start-0 ${errors.bloodType ? 'is-invalid' : ''}`}
                                                            value={formData.bloodType}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Select Blood Type</option>
                                                            <option value="A+">A Positive (A+)</option>
                                                            <option value="A-">A Negative (A-)</option>
                                                            <option value="B+">B Positive (B+)</option>
                                                            <option value="B-">B Negative (B-)</option>
                                                            <option value="AB+">AB Positive (AB+)</option>
                                                            <option value="AB-">AB Negative (AB-)</option>
                                                            <option value="O+">O Positive (O+)</option>
                                                            <option value="O-">O Negative (O-)</option>
                                                        </select>
                                                    </div>
                                                    {errors.bloodType && (
                                                        <div className="text-danger small mt-1">{errors.bloodType}</div>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Gender <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-venus-mars text-muted"></i>
                                                        </span>
                                                        <select
                                                            name="gender"
                                                            className={`form-select form-select-lg border-start-0 ${errors.gender ? 'is-invalid' : ''}`}
                                                            value={formData.gender}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                            <option value="PreferNotToSay">Prefer not to say</option>
                                                        </select>
                                                    </div>
                                                    {errors.gender && (
                                                        <div className="text-danger small mt-1">{errors.gender}</div>
                                                    )}
                                                </div>

                                                {/* Profile Image */}
                                                <div className="col-12">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        <i className="fas fa-user-circle me-2"></i>Profile Image (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        name="profileImage"
                                                        className="form-control form-control-lg"
                                                        accept="image/*"
                                                        onChange={handleChange}
                                                    />
                                                    <div className="form-text">
                                                        <i className="fas fa-info-circle text-info"></i> Upload a profile picture (JPG, PNG, GIF, BMP - Max 5MB)
                                                    </div>
                                                </div>

                                                {/* Image Preview */}
                                                {formData.profilePreview && (
                                                    <div className="col-12 text-center mt-3">
                                                        <img
                                                            src={formData.profilePreview}
                                                            alt="Profile Preview"
                                                            className="mt-2 rounded shadow-sm img-preview"
                                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Address Information */}
                                    {currentStep === 2 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-map-marker-alt me-2"></i>Address Information
                                                </h4>
                                                <p className="text-muted mb-0">Where can we reach you?</p>
                                            </div>

                                            <div className="row g-3">
                                                {/* Address */}
                                                <div className="col-12">
                                                    <label className="form-label fw-bold form-label-primary">Street Address</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-home text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            className="form-control form-control-lg border-start-0"
                                                            placeholder="123 Main Street"
                                                            value={formData.address}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>

                                                {/* City */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        City <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-city text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            className={`form-control form-control-lg border-start-0 ${errors.city ? 'is-invalid' : ''}`}
                                                            placeholder="Your city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.city && (
                                                        <div className="text-danger small mt-1">{errors.city}</div>
                                                    )}
                                                </div>

                                                {/* State */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        State/Province <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-map-pin text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            className={`form-control form-control-lg border-start-0 ${errors.state ? 'is-invalid' : ''}`}
                                                            placeholder="Your state"
                                                            value={formData.state}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.state && (
                                                        <div className="text-danger small mt-1">{errors.state}</div>
                                                    )}
                                                </div>

                                                {/* Zip Code */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">Zip/Postal Code</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-mail-bulk text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            name="zipCode"
                                                            className="form-control form-control-lg border-start-0"
                                                            placeholder="12345"
                                                            value={formData.zipCode}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Appointment Scheduling */}
                                    {currentStep === 3 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-calendar-check me-2"></i>Schedule Your First Donation
                                                </h4>
                                                <p className="text-muted mb-0">Book your appointment (Optional)</p>
                                            </div>

                                            <div className="alert alert-info border-0 mb-4 appointment-alert">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-info-circle fa-lg me-3"></i>
                                                    <div>
                                                        <strong className="d-block mb-1">Optional but recommended!</strong>
                                                        Schedule your first blood donation appointment now. You can always schedule later from your dashboard.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                {/* Verification Center */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        <i className="fas fa-hospital me-2"></i>Verification Center
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-shield-alt text-success"></i>
                                                        </span>
                                                        <select
                                                            name="hospitalId"
                                                            className={`form-select form-select-lg border-start-0 ${errors.hospitalId ? 'is-invalid' : ''}`}
                                                            value={formData.hospitalId}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Select Verification Center</option>
                                                            {hospitals.map((hospital) => (
                                                                <option key={hospital.id} value={hospital.id}>
                                                                    {hospital.name} - {hospital.address}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {errors.hospitalId && (
                                                        <div className="text-danger small mt-1">{errors.hospitalId}</div>
                                                    )}
                                                    <div className="form-text">
                                                        <i className="fas fa-shield-check text-success me-1"></i> Certified blood donation centers
                                                    </div>
                                                </div>

                                                {/* Appointment Date */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        <i className="fas fa-calendar-day me-2"></i>Preferred Date
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-clock text-info"></i>
                                                        </span>
                                                        <input
                                                            type="date"
                                                            name="appointmentDate"
                                                            className={`form-control form-control-lg border-start-0 ${errors.appointmentDate ? 'is-invalid' : ''}`}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            max={getMaxAppointmentDate()}
                                                            value={formData.appointmentDate || getDefaultAppointmentDate()}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.appointmentDate && (
                                                        <div className="text-danger small mt-1">{errors.appointmentDate}</div>
                                                    )}
                                                </div>

                                                {/* Time Slots */}
                                                <div className="col-12">
                                                    <label className="form-label fw-bold mb-3 form-label-primary">
                                                        <i className="fas fa-clock me-2"></i>Preferred Time Slot
                                                    </label>
                                                    <div className="time-slots-container">
                                                        <div className="row g-2">
                                                            {timeSlots.map((time) => (
                                                                <div key={time} className="col-6 col-md-3">
                                                                    <div className="form-check">
                                                                        <input
                                                                            type="radio"
                                                                            name="timeSlot"
                                                                            id={`time-${time}`}
                                                                            className="form-check-input"
                                                                            value={time}
                                                                            checked={formData.timeSlot === time}
                                                                            onChange={handleChange}
                                                                        />
                                                                        <label
                                                                            htmlFor={`time-${time}`}
                                                                            className="form-check-label time-slot-label"
                                                                        >
                                                                            {time}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {errors.timeSlot && (
                                                        <div className="text-danger small mt-1">{errors.timeSlot}</div>
                                                    )}
                                                </div>

                                                {/* Appointment Notes */}
                                                <div className="col-12">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        <i className="fas fa-sticky-note me-2"></i>Special Notes (Optional)
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                                                            <i className="fas fa-edit text-muted"></i>
                                                        </span>
                                                        <textarea
                                                            name="appointmentNotes"
                                                            className="form-control border-start-0"
                                                            rows="3"
                                                            placeholder="Any special requirements or notes for your appointment..."
                                                            value={formData.appointmentNotes}
                                                            onChange={handleChange}
                                                        ></textarea>
                                                    </div>
                                                    <div className="form-text mt-2">
                                                        <i className="fas fa-info-circle text-info me-1"></i> E.g., preferred arm, accessibility needs, etc.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Account Security */}
                                    {currentStep === 4 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-shield-alt me-2"></i>Account Security
                                                </h4>
                                                <p className="text-muted mb-0">Create secure login credentials</p>
                                            </div>

                                            <div className="row g-3">
                                                {/* Password */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Password <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-lock text-muted"></i>
                                                        </span>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
                                                            className={`form-control form-control-lg border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                                                            placeholder="Create a strong password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary border-start-0 password-toggle"
                                                            onClick={() => togglePasswordVisibility('password')}
                                                        >
                                                            <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {errors.password && (
                                                        <div className="text-danger small mt-1">{errors.password}</div>
                                                    )}
                                                    <div className="form-text">
                                                        <i className="fas fa-info-circle text-info"></i> Must be at least 8 characters
                                                    </div>
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Confirm Password <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-end-0">
                                                            <i className="fas fa-lock text-muted"></i>
                                                        </span>
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirmPassword"
                                                            className={`form-control form-control-lg border-start-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                            placeholder="Confirm your password"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary border-start-0 password-toggle"
                                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                                        >
                                                            <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {errors.confirmPassword && (
                                                        <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                                    )}
                                                </div>

                                                {/* Preferences */}
                                                <div className="col-12">
                                                    <div className="preference-card p-3 rounded-3 bg-light">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                name="wantsNotifications"
                                                                id="notifications"
                                                                className="form-check-input"
                                                                checked={formData.wantsNotifications}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="form-check-label fw-bold form-label-primary" htmlFor="notifications">
                                                                <i className="fas fa-bell text-warning me-2"></i>Send me notifications about urgent blood needs
                                                            </label>
                                                            <div className="form-text ms-4">
                                                                We'll alert you when your blood type is urgently needed in your area
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Terms */}
                                                <div className="col-12">
                                                    <div className="terms-card p-3 rounded-3 border">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                name="acceptedTerms"
                                                                id="terms"
                                                                className={`form-check-input ${errors.acceptedTerms ? 'is-invalid' : ''}`}
                                                                checked={formData.acceptedTerms}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                            <label className="form-check-label fw-bold form-label-primary" htmlFor="terms">
                                                                I agree to the <a href="#" className="text-decoration-none terms-link">Terms of Service</a> and <a href="#" className="text-decoration-none terms-link">Privacy Policy</a> <span className="text-danger">*</span>
                                                            </label>
                                                            {errors.acceptedTerms && (
                                                                <div className="text-danger small mt-2">{errors.acceptedTerms}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                        {currentStep > 1 ? (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-lg px-4"
                                                onClick={handlePrevStep}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>Back
                                            </button>
                                        ) : (
                                            <div></div>
                                        )}

                                        {currentStep < 4 ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-lg px-5"
                                                onClick={handleNextStep}
                                                disabled={loading}
                                            >
                                                Continue to {currentStep === 1 ? 'Address Info' : currentStep === 2 ? 'Schedule' : 'Account Security'}
                                                <i className="fas fa-arrow-right ms-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg submit-btn"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Complete Registration & Schedule 🚀
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Login Link */}
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none fw-medium login-link">
                                        <i className="fas fa-sign-in-alt me-2"></i>Already have an account? Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Benefits Sidebar */}
                        <div className="mt-4">
                            <div className="card border-0 shadow-sm benefits-card">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold text-center mb-4 benefits-title">
                                        <i className="fas fa-gift text-danger me-2"></i>Why Schedule Now?
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-4 text-center">
                                            <div className="benefit-icon mb-3">
                                                <i className="fas fa-calendar-check fa-2x text-success"></i>
                                            </div>
                                            <p className="fw-bold mb-1 benefit-text">Guaranteed Slot</p>
                                            <small className="text-muted">Reserve your preferred time</small>
                                        </div>
                                        <div className="col-md-4 text-center">
                                            <div className="benefit-icon mb-3">
                                                <i className="fas fa-map-marker-alt fa-2x text-primary"></i>
                                            </div>
                                            <p className="fw-bold mb-1 benefit-text">Choose Location</p>
                                            <small className="text-muted">Pick the most convenient center</small>
                                        </div>
                                        <div className="col-md-4 text-center">
                                            <div className="benefit-icon mb-3">
                                                <i className="fas fa-bolt fa-2x text-warning"></i>
                                            </div>
                                            <p className="fw-bold mb-1 benefit-text">Quick Process</p>
                                            <small className="text-muted">Skip the scheduling later</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Registration;