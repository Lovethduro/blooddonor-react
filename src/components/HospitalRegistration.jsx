// src/components/HospitalRegistration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalRegistration.css';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Hospital Information
        hospitalName: '',
        address: '',
        city: '',
        contactPerson: '',

        // Contact Information
        phoneNumber: '',
        email: '',

        // Login Credentials
        password: '',
        confirmPassword: '',

        // Status
        isActive: true,

        // Location coordinates
        latitude: null,
        longitude: null
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationFetched, setLocationFetched] = useState(false);
    const [locationMethod, setLocationMethod] = useState(''); // 'gps' or 'ip'

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            console.log('Reverse geocoding:', lat, lng);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'BloodDonorApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Geocoding service returned ${response.status}`);
            }

            const data = await response.json();
            console.log('Geocode result:', data);

            if (data && data.address) {
                const address = data.address;
                console.log('Address object:', address);

                // Extract address components with comprehensive field mapping
                const streetAddress = [
                    address.house_number,
                    address.road,
                    address.footway,
                    address.pedestrian,
                    address.path,
                    address.cycleway
                ].filter(Boolean).join(' ') || '';

                const neighborhood = address.suburb || address.neighbourhood || address.city_district || '';
                const city = address.city || address.town || address.village || address.municipality ||
                           address.hamlet || address.locality || '';

                // Construct full address
                const addressParts = [streetAddress, neighborhood].filter(Boolean);
                const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name.split(',')[0];

                console.log('Extracted fields:', {
                    streetAddress,
                    neighborhood,
                    city,
                    fullAddress
                });

                setFormData(prev => ({
                    ...prev,
                    address: fullAddress,
                    city: city
                }));

                return; // Success with Nominatim
            }

            // If Nominatim fails, try a fallback geocoding service
            console.log('Nominatim failed, trying fallback geocoding...');

            // Try BigDataCloud (free tier)
            try {
                const fallbackResponse = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
                    {
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    console.log('Fallback geocode result:', fallbackData);

                    if (fallbackData && fallbackData.localityInfo) {
                        const locality = fallbackData.localityInfo.administrative;

                        setFormData(prev => ({
                            ...prev,
                            address: fallbackData.localityInfo.informative?.[0]?.description ||
                                    `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                            city: fallbackData.city || fallbackData.locality || ''
                        }));

                        return; // Success with fallback
                    }
                }
            } catch (fallbackError) {
                console.warn('Fallback geocoding failed:', fallbackError);
            }

            // Final fallback - just set coordinates
            console.log('All geocoding services failed, using coordinates only');
            setFormData(prev => ({
                ...prev,
                address: `GPS Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                city: 'Location detected'
            }));

        } catch (error) {
            console.error('Reverse geocoding failed:', error);

            // Set minimal fallback
            setFormData(prev => ({
                ...prev,
                address: `GPS Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                city: 'Location detected'
            }));
        }
    };

    const getGPSLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 30000, // 30 seconds
                    maximumAge: 300000 // Accept locations up to 5 minutes old
                }
            );
        });
    };

    const getIPLocation = async () => {
        console.log('Trying IP-based location...');

        const services = [
            {
                url: 'https://ipapi.co/json/',
                parse: (data) => data.latitude && data.longitude ?
                    { latitude: data.latitude, longitude: data.longitude } : null
            },
            {
                url: 'https://freegeoip.app/json/',
                parse: (data) => data.latitude && data.longitude ?
                    { latitude: data.latitude, longitude: data.longitude } : null
            }
        ];

        for (const service of services) {
            try {
                console.log('Trying:', service.url);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(service.url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'BloodDonorApp/1.0'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) continue;

                const data = await response.json();
                const location = service.parse(data);

                if (location) {
                    console.log('IP location success:', location);
                    return location;
                }
            } catch (error) {
                console.warn(`Service ${service.url} failed:`, error.message);
                continue;
            }
        }

        throw new Error('All IP location services failed');
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        setErrorMessage('');
        setSuccessMessage('Detecting your location... This may take up to 30 seconds.');

        try {
            // Try GPS first (most accurate)
            console.log('Attempting GPS location...');
            const gpsPosition = await getGPSLocation();

            if (gpsPosition && gpsPosition.coords) {
                const { latitude, longitude, accuracy } = gpsPosition.coords;
                console.log('GPS success:', latitude, longitude, '±' + Math.round(accuracy) + 'm');

                setFormData(prev => ({
                    ...prev,
                    latitude,
                    longitude
                }));

                await reverseGeocode(latitude, longitude);

                setLocationFetched(true);
                setLocationMethod('gps');
                setSuccessMessage(`✅ Precise location found! Accuracy: ±${Math.round(accuracy)} meters`);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (gpsError) {
            console.warn('GPS failed:', gpsError.message);

            try {
                // Fallback to IP-based location
                console.log('Trying IP-based location...');
                setSuccessMessage('GPS unavailable, trying IP-based location...');

                const ipLocation = await getIPLocation();
                if (ipLocation) {
                    const { latitude, longitude } = ipLocation;
                    console.log('IP location success:', latitude, longitude);

                    setFormData(prev => ({
                        ...prev,
                        latitude,
                        longitude
                    }));

                    await reverseGeocode(latitude, longitude);

                    setLocationFetched(true);
                    setLocationMethod('ip');
                    setSuccessMessage('📍 Location found using IP address (approximate city-level accuracy)');
                    setTimeout(() => setSuccessMessage(''), 5000);
                }
            } catch (ipError) {
                console.error('IP location failed:', ipError);
                setErrorMessage(
                    'Unable to detect your location. Please ensure location permissions are enabled in your browser and try again. ' +
                    'For best results, use a modern browser like Chrome or Firefox.'
                );
            }
        } finally {
            setLocationLoading(false);
        }
    };

    const resetLocation = () => {
        setLocationFetched(false);
        setLocationMethod('');
        setFormData(prev => ({
            ...prev,
            latitude: null,
            longitude: null,
            address: '',
            city: ''
        }));
        setSuccessMessage('');
        setErrorMessage('');
    };

    const validateForm = () => {
        const newErrors = {};

        // Hospital Information
        if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

        // Location validation
        if (!formData.latitude || !formData.longitude) {
            newErrors.location = 'Please detect your location using the button above. Location is required for hospital registration.';
        }

        // Contact Information
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        else if (!/^[\(\)\-\s\d\+]{10,20}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        if (!formData.email.trim()) newErrors.email = 'Email address is required';
        else if (!/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Login Credentials
        if (!formData.password) newErrors.password = 'Password is required';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

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
            const response = await fetch(`${API_BASE_URL}/auth/register-hospital`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    HospitalName: formData.hospitalName,
                    Address: formData.address,
                    City: formData.city,
                    ContactPerson: formData.contactPerson,
                    PhoneNumber: formData.phoneNumber,
                    Email: formData.email,
                    Password: formData.password,
                    IsActive: formData.isActive,
                    Latitude: formData.latitude,
                    Longitude: formData.longitude
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccessMessage('Hospital registered successfully! Our team will review your application and contact you within 2 business days.');
            
            // Clear form after successful registration
            setFormData({
                hospitalName: '',
                address: '',
                city: '',
                contactPerson: '',
                phoneNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                isActive: true,
                latitude: null,
                longitude: null
            });
            setLocationFetched(false);
            setLocationMethod('');

        } catch (error) {
            setErrorMessage(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="hospital-registration-page">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Header */}
                        <div className="text-center mb-5">
                            <h1 className="display-5 fw-bold text-primary mb-3">
                                <i className="fas fa-hospital me-3"></i>Hospital Registration
                            </h1>
                            <p className="lead text-muted">Join our network of healthcare providers and help save lives</p>
                        </div>

                        {/* Success/Error Messages */}
                        {successMessage && (
                            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                                <i className="fas fa-check-circle me-2"></i>
                                {successMessage}
                                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {errorMessage}
                                <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                            </div>
                        )}

                        {/* Registration Form */}
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                <h4 className="card-title mb-4" style={{color: '#0d3b64'}}>
                                    Hospital Information <span className="text-danger">*</span>
                                    <small className="text-muted">All fields are required</small>
                                </h4>

                                <form onSubmit={handleSubmit}>
                                    {/* Hospital Basic Info */}
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">
                                                Hospital Name <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-hospital text-muted"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="hospitalName"
                                                    className={`form-control border-start-0 ${errors.hospitalName ? 'is-invalid' : ''}`}
                                                    placeholder="Enter hospital name"
                                                    value={formData.hospitalName}
                                                    onChange={handleChange}
                                                    maxLength="255"
                                                />
                                            </div>
                                            {errors.hospitalName && (
                                                <div className="text-danger small mt-1">{errors.hospitalName}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                Contact Person <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-user text-muted"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="contactPerson"
                                                    className={`form-control border-start-0 ${errors.contactPerson ? 'is-invalid' : ''}`}
                                                    placeholder="Full name"
                                                    value={formData.contactPerson}
                                                    onChange={handleChange}
                                                    maxLength="255"
                                                />
                                            </div>
                                            {errors.contactPerson && (
                                                <div className="text-danger small mt-1">{errors.contactPerson}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                Phone Number <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-phone text-muted"></i>
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    className={`form-control border-start-0 ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                                    placeholder="(123) 456-7890"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    maxLength="50"
                                                />
                                            </div>
                                            {errors.phoneNumber && (
                                                <div className="text-danger small mt-1">{errors.phoneNumber}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">
                                                Hospital Location <span className="text-danger">*</span>
                                            </label>
                                            <p className="text-muted small mb-3">
                                                Detect your hospital's exact location using GPS for accurate donor matching.
                                            </p>
                                            
                                            {/* Location Controls */}
                                            <div className="d-flex gap-2 mb-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-lg"
                                                    onClick={getCurrentLocation}
                                                    disabled={locationLoading || locationFetched}
                                                >
                                                    {locationLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Detecting Location...
                                                        </>
                                                    ) : locationFetched ? (
                                                        <>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            Location Detected
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-crosshairs me-2"></i>
                                                            Detect My Location
                                                        </>
                                                    )}
                                                </button>

                                                {locationFetched && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={resetLocation}
                                                    >
                                                        <i className="fas fa-redo me-2"></i>
                                                        Reset Location
                                                    </button>
                                                )}
                                            </div>

                                            {/* Location Status */}
                                            {locationFetched && (
                                                <div className="alert alert-success">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-map-marker-alt me-2"></i>
                                                        <div>
                                                            <strong>Location {locationMethod === 'gps' ? 'GPS' : 'IP'} Detected</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                Coordinates: {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                                                                {locationMethod === 'ip' && ' (city-level accuracy)'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {errors.location && (
                                                <div className="text-danger small mt-2">{errors.location}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Auto-filled Address Fields */}
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">
                                                Address <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                                                    <i className="fas fa-map-marker-alt text-muted"></i>
                                                </span>
                                                <textarea
                                                    name="address"
                                                    className={`form-control border-start-0 ${errors.address ? 'is-invalid' : ''}`}
                                                    placeholder="Address will be auto-detected from your location"
                                                    rows="2"
                                                    value={formData.address}
                                                    readOnly
                                                />
                                            </div>
                                            {errors.address && (
                                                <div className="text-danger small mt-1">{errors.address}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">
                                                City <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-city text-muted"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    className={`form-control border-start-0 ${errors.city ? 'is-invalid' : ''}`}
                                                    placeholder="Auto-detected from location"
                                                    value={formData.city}
                                                    readOnly
                                                />
                                            </div>
                                            {errors.city && (
                                                <div className="text-danger small mt-1">{errors.city}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">
                                                Email Address <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-envelope text-muted"></i>
                                                </span>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                                                    placeholder="email@hospital.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    maxLength="255"
                                                />
                                            </div>
                                            {errors.email && (
                                                <div className="text-danger small mt-1">{errors.email}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Login Credentials */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <h5 className="fw-bold mb-3" style={{color: '#0d3b64'}}>
                                                Login Credentials <span className="text-danger">*</span>
                                            </h5>
                                            <p className="text-muted small mb-3">
                                                This will be used to access your hospital account.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                Password <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-lock text-muted"></i>
                                                </span>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                                                    placeholder="Create a password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    maxLength="100"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary border-start-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <div className="text-danger small mt-1">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">
                                                Confirm Password <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <i className="fas fa-lock text-muted"></i>
                                                </span>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    className={`form-control border-start-0 border-end-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                    placeholder="Confirm your password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    maxLength="100"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary border-start-0"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="row">
                                        <div className="col-md-12 mb-4">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="isActive"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="isActive" style={{color: '#355677'}}>
                                                    Active Facility <span className="text-danger">*</span>
                                                </label>
                                            </div>
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Inactive facilities won't appear in donor searches or appointment bookings.
                                            </small>
                                        </div>
                                    </div>

                                    {/* Verification Center Info */}
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="alert alert-warning">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-shield-alt me-2"></i>Verification Center Status
                                                </h6>
                                                <p className="mb-0 small">
                                                    All new hospitals are registered as standard facilities. Verification Center status
                                                    can only be assigned by system administrators after review and approval.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="row mt-4">
                                        <div className="col-md-6 mb-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 py-3 fw-bold"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Registering...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-hospital me-2"></i>
                                                        Register Hospital
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-lg w-100 py-3"
                                                onClick={handleCancel}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-times me-2"></i>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="alert alert-info">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-lightbulb me-2"></i>Important Information
                                                </h6>
                                                <p className="mb-0 small">
                                                    All fields marked with <span className="text-danger">*</span> are required.
                                                    After registration, our team will review your application and contact you within 2 business days.
                                                    Once approved, your facility will be visible to donors in our system.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalRegistration;