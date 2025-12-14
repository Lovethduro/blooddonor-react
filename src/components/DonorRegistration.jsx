import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorRegistration.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const DonorRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        bloodType: '',
        gender: '',
        address: '',
        city: '',
        latitude: null,
        longitude: null,
        scheduleAppointment: false,
        hospitalId: '',
        appointmentDate: '',
        appointmentTime: '09:00',
        appointmentNotes: '',
        preferredArm: '',
        accessibilityNeeds: '',
        acceptTerms: false,
        receiveNotifications: true
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationFetched, setLocationFetched] = useState(false);
    const [nearbyHospitals, setNearbyHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const bloodTypes = [
        { value: 'A+', label: 'A Positive (A+)' },
        { value: 'A-', label: 'A Negative (A-)' },
        { value: 'B+', label: 'B Positive (B+)' },
        { value: 'B-', label: 'B Negative (B-)' },
        { value: 'AB+', label: 'AB Positive (AB+)' },
        { value: 'AB-', label: 'AB Negative (AB-)' },
        { value: 'O+', label: 'O Positive (O+)' },
        { value: 'O-', label: 'O Negative (O-)' }
    ];

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
        '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    useEffect(() => {
        // Set minimum date for date of birth (18 years ago)
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 60, today.getMonth(), today.getDate());

        if (document.getElementById('dateOfBirth')) {
            document.getElementById('dateOfBirth').max = minDate.toISOString().split('T')[0];
            document.getElementById('dateOfBirth').min = maxDate.toISOString().split('T')[0];
        }

        // Set minimum date for appointment (3 days from now)
        const minAppointmentDate = new Date();
        minAppointmentDate.setDate(today.getDate() + 3);

        if (document.getElementById('appointmentDate')) {
            document.getElementById('appointmentDate').min = minAppointmentDate.toISOString().split('T')[0];
        }
    }, []);

    const getCurrentLocation = () => {
        setLocationLoading(true);
        setMessage('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        latitude,
                        longitude
                    }));

                    await reverseGeocode(latitude, longitude);
                    setLocationFetched(true);
                    setLocationLoading(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setMessage('Unable to get your location. Please enter your address manually.');
                    setMessageType('warning');
                    setLocationLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 300000
                }
            );
        } else {
            setMessage('Geolocation is not supported by this browser.');
            setMessageType('error');
            setLocationLoading(false);
        }
    };

    const getIPLocation = async () => {
        try {
            const services = [
                'https://ipapi.co/json/',
                'https://api.ipify.org?format=json'
            ];

            for (const service of services) {
                try {
                    const response = await fetch(service);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.latitude && data.longitude) {
                            setFormData(prev => ({
                                ...prev,
                                latitude: data.latitude,
                                longitude: data.longitude
                            }));
                            await reverseGeocode(data.latitude, data.longitude);
                            setLocationFetched(true);
                            return;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            throw new Error('All IP location services failed');
        } catch (error) {
            console.error('IP location error:', error);
            setMessage('Unable to determine your location automatically. Please enter your address manually.');
            setMessageType('warning');
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const services = [
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            ];

            for (const service of services) {
                try {
                    const response = await fetch(service);
                    if (response.ok) {
                        const data = await response.json();

                        let address = '';
                        let city = '';

                        if (data.display_name) {
                            // Nominatim response
                            const parts = data.display_name.split(', ');
                            address = parts[0] || '';
                            city = parts[2] || parts[1] || '';
                        } else if (data.localityInfo) {
                            // BigDataCloud response
                            const info = data.localityInfo.administrative;
                            city = info[2]?.name || info[1]?.name || '';
                            address = data.locality || '';
                        }

                        setFormData(prev => ({
                            ...prev,
                            address,
                            city
                        }));

                        // Load nearby hospitals
                        await loadNearbyHospitals(lat, lng);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    };

    const loadNearbyHospitals = async (lat, lng) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/nearby-hospitals?latitude=${lat}&longitude=${lng}&radiusKm=50`);
            if (response.ok) {
                const hospitals = await response.json();
                setNearbyHospitals(hospitals);
            }
        } catch (error) {
            console.error('Failed to load nearby hospitals:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File size must be less than 5MB');
                setMessageType('error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setMessage('Please select a valid image file');
                setMessageType('error');
                return;
            }

            setProfileImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            let profileImageBase64 = null;
            if (profileImage) {
                profileImageBase64 = await convertImageToBase64(profileImage);
            }

            const submitData = {
                ...formData,
                profileImageBase64
            };

            const response = await fetch(`${API_BASE_URL}/auth/register-donor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
                setMessageType('success');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(result.message || 'Registration failed');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Registration failed. Please try again.');
            setMessageType('error');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="donor-registration">
            {/* Back Button */}
            <div className="container mt-3">
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/')}
                >
                    <i className="fas fa-arrow-left me-2"></i>Back to Home
                </button>
            </div>

            {/* Hero Section */}
            <section className="hero-section text-center py-5 text-white" style={{
                background: 'linear-gradient(135deg, #0d3b64 0%, #355677 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h1 className="hero-title fw-bold mb-3 display-5">Join the Life-Saving Team!</h1>
                            <p className="hero-subtitle lead fs-5 mb-4 opacity-75">
                                Complete your hero profile and schedule your first donation
                            </p>
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
                            <div className="card-header text-white text-center py-4 card-header-wave"
                                 style={{background: 'linear-gradient(135deg, #0d3b64 0%, #2a4a6e 100%)'}}>
                                <div className="position-relative">
                                    <h3 className="fw-bold mb-2">
                                        <i className="fas fa-user-plus me-2"></i>Create Your Donor Profile
                                    </h3>
                                    <p className="mb-0 opacity-75">
                                        Complete all sections to become a verified blood donor
                                    </p>
                                </div>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {/* Alert Message */}
                                {message && (
                                    <div className={`alert alert-${messageType === 'success' ? 'success' : messageType === 'error' ? 'danger' : 'warning'} alert-dismissible fade show`}>
                                        {message}
                                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                                    </div>
                                )}

                                {/* Progress Indicator */}
                                <div className="progress-indicator mb-5">
                                    <div className="d-flex justify-content-between position-relative">
                                        <div className="step active text-center">
                                            <div className="step-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 position-relative">
                                                1
                                                <div className="step-circle-border"></div>
                                            </div>
                                            <small className="fw-bold step-label">Personal Info</small>
                                        </div>
                                        <div className={`step ${currentStep >= 2 ? 'active' : ''} text-center`}>
                                            <div className={`step-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 step-inactive`}>
                                                2
                                            </div>
                                            <small className={`step-label ${currentStep >= 2 ? 'fw-bold' : 'text-muted'}`}>Location</small>
                                        </div>
                                        <div className={`step ${currentStep >= 3 ? 'active' : ''} text-center`}>
                                            <div className={`step-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 step-inactive`}>
                                                3
                                            </div>
                                            <small className={`step-label ${currentStep >= 3 ? 'fw-bold' : 'text-muted'}`}>Appointment</small>
                                        </div>
                                        <div className={`step ${currentStep >= 4 ? 'active' : ''} text-center`}>
                                            <div className={`step-circle rounded-circle d-inline-flex align-items-center justify-content-center mb-2 step-inactive`}>
                                                4
                                            </div>
                                            <small className={`step-label ${currentStep >= 4 ? 'fw-bold' : 'text-muted'}`}>Complete</small>
                                        </div>
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
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Full Name <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Email Address <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-lg"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="your.email@example.com"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Phone Number <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="form-control form-control-lg"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+1 (555) 123-4567"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Date of Birth <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-lg"
                                                        id="dateOfBirth"
                                                        name="dateOfBirth"
                                                        value={formData.dateOfBirth}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Blood Type <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select form-select-lg"
                                                        name="bloodType"
                                                        value={formData.bloodType}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Blood Type</option>
                                                        {bloodTypes.map(type => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Gender <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select form-select-lg"
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                        <option value="PreferNotToSay">Prefer not to say</option>
                                                    </select>
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        <i className="fas fa-user-circle me-2"></i>Profile Image (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className="form-control form-control-lg"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                    <div className="form-text">
                                                        <i className="fas fa-info-circle text-info"></i> Upload a profile picture (JPG, PNG, GIF, BMP - Max 5MB)
                                                    </div>
                                                </div>

                                                {imagePreview && (
                                                    <div className="col-12 text-center">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Profile Preview"
                                                            className="rounded shadow-sm"
                                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center mt-4">
                                                <button type="button" className="btn btn-primary btn-lg px-4" onClick={nextStep}>
                                                    Next: Location <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Location Information */}
                                    {currentStep === 2 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-map-marker-alt me-2"></i>Location Information
                                                </h4>
                                                <p className="text-muted mb-0">Where can we reach you?</p>
                                            </div>

                                            <div className="alert alert-info mb-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-info-circle fa-lg me-3"></i>
                                                    <div>
                                                        <strong>Find Nearby Hospitals</strong>
                                                        <p className="mb-0">We'll use your location to show verified hospitals near you for appointments.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mb-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-lg px-4"
                                                    onClick={getCurrentLocation}
                                                    disabled={locationLoading}
                                                >
                                                    {locationLoading ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin me-2"></i>Getting Location...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-location-arrow me-2"></i>Detect My Location
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {locationFetched && (
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label className="form-label fw-bold form-label-primary">Street Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            placeholder="Street address"
                                                        />
                                                    </div>

                                                    <div className="col-md-12">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            City <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            placeholder="Your city"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!locationFetched && !locationLoading && (
                                                <div className="text-center text-muted">
                                                    <i className="fas fa-map-marked-alt fa-3x mb-3"></i>
                                                    <p>Click "Detect My Location" to automatically find hospitals near you</p>
                                                </div>
                                            )}

                                            {nearbyHospitals.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="fw-bold mb-3">
                                                        <i className="fas fa-hospital me-2"></i>Nearby Hospitals Found
                                                    </h5>
                                                    <div className="row g-3">
                                                        {nearbyHospitals.slice(0, 3).map(hospital => (
                                                            <div key={hospital.id} className="col-md-4">
                                                                <div className="card h-100 border-primary">
                                                                    <div className="card-body">
                                                                        <h6 className="card-title">{hospital.hospitalName}</h6>
                                                                        <p className="card-text small text-muted">
                                                                            {hospital.address}, {hospital.city}<br />
                                                                            {hospital.distance} km away
                                                                        </p>
                                                                        <small className="text-success">
                                                                            <i className="fas fa-shield-check me-1"></i>Verified Center
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between mt-4">
                                                <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={prevStep}>
                                                    <i className="fas fa-arrow-left me-2"></i> Back
                                                </button>
                                                <button type="button" className="btn btn-primary btn-lg px-4" onClick={nextStep}>
                                                    Next: Appointment <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
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

                                            <div className="mb-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="scheduleAppointment"
                                                        name="scheduleAppointment"
                                                        checked={formData.scheduleAppointment}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor="scheduleAppointment">
                                                        I want to schedule my first donation appointment now
                                                    </label>
                                                </div>
                                            </div>

                                            {formData.scheduleAppointment && (
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-hospital me-2"></i>Verification Center <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select form-select-lg"
                                                            name="hospitalId"
                                                            value={formData.hospitalId}
                                                            onChange={handleInputChange}
                                                            required={formData.scheduleAppointment}
                                                        >
                                                            <option value="">Select Verification Center</option>
                                                            {nearbyHospitals.map(hospital => (
                                                                <option key={hospital.id} value={hospital.id}>
                                                                    {hospital.hospitalName} ({hospital.distance} km)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-calendar-day me-2"></i>Preferred Date <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control form-control-lg"
                                                            id="appointmentDate"
                                                            name="appointmentDate"
                                                            value={formData.appointmentDate}
                                                            onChange={handleInputChange}
                                                            required={formData.scheduleAppointment}
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-clock me-2"></i>Preferred Time <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-select form-select-lg"
                                                            name="appointmentTime"
                                                            value={formData.appointmentTime}
                                                            onChange={handleInputChange}
                                                            required={formData.scheduleAppointment}
                                                        >
                                                            {timeSlots.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-hand-paper me-2"></i>Preferred Arm
                                                        </label>
                                                        <select
                                                            className="form-select form-select-lg"
                                                            name="preferredArm"
                                                            value={formData.preferredArm}
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">No preference</option>
                                                            <option value="Left">Left Arm</option>
                                                            <option value="Right">Right Arm</option>
                                                        </select>
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-sticky-note me-2"></i>Special Notes (Optional)
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            name="appointmentNotes"
                                                            value={formData.appointmentNotes}
                                                            onChange={handleInputChange}
                                                            rows="3"
                                                            placeholder="Any special requirements or notes for your appointment..."
                                                        ></textarea>
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label fw-bold form-label-primary">
                                                            <i className="fas fa-wheelchair me-2"></i>Accessibility Needs (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            name="accessibilityNeeds"
                                                            value={formData.accessibilityNeeds}
                                                            onChange={handleInputChange}
                                                            placeholder="E.g., wheelchair access, sign language interpreter"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between mt-4">
                                                <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={prevStep}>
                                                    <i className="fas fa-arrow-left me-2"></i> Back
                                                </button>
                                                <button type="button" className="btn btn-primary btn-lg px-4" onClick={nextStep}>
                                                    Next: Security <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Account Security & Preferences */}
                                    {currentStep === 4 && (
                                        <div className="section-card mb-5">
                                            <div className="section-header mb-4">
                                                <h4 className="fw-bold mb-2 section-title">
                                                    <i className="fas fa-shield-alt me-2"></i>Account Security & Preferences
                                                </h4>
                                                <p className="text-muted mb-0">Create secure login credentials</p>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Password <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-lg"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Create a strong password"
                                                        required
                                                        minLength="8"
                                                    />
                                                    <div className="form-text">
                                                        <i className="fas fa-info-circle text-info"></i> Must be at least 8 characters
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold form-label-primary">
                                                        Confirm Password <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-lg"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Confirm your password"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="section-card mt-4">
                                                <h5 className="fw-bold mb-3">
                                                    <i className="fas fa-comments me-2"></i>Communication Preferences
                                                </h5>

                                                <div className="mb-3">
                                                    <div className="preference-card p-3 rounded-3 bg-light">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="receiveNotifications"
                                                                name="receiveNotifications"
                                                                checked={formData.receiveNotifications}
                                                                onChange={handleInputChange}
                                                            />
                                                            <label className="form-check-label fw-bold form-label-primary" htmlFor="receiveNotifications">
                                                                <i className="fas fa-bell text-warning me-2"></i>Send me notifications about urgent blood needs
                                                            </label>
                                                            <div className="form-text ms-4">
                                                                We'll alert you when your blood type is urgently needed in your area
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="terms-card p-3 rounded-3 border">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="acceptTerms"
                                                            name="acceptTerms"
                                                            checked={formData.acceptTerms}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                        <label className="form-check-label fw-bold form-label-primary" htmlFor="acceptTerms">
                                                            I agree to the <a href="#" className="text-decoration-none terms-link">Terms of Service</a> and <a href="#" className="text-decoration-none terms-link">Privacy Policy</a> <span className="text-danger">*</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between mt-4">
                                                <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={prevStep}>
                                                    <i className="fas fa-arrow-left me-2"></i> Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin me-2"></i>Creating Account...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Complete Registration & Schedule 🚀
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </form>
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

export default DonorRegistration;
