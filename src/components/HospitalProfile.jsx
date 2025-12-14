import React, { useState, useEffect, useRef } from 'react';
import HospitalNavbar from './HospitalNavbar';
import { getDefaultAvatarSVG } from './DefaultAvatars';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const HospitalProfile = () => {
    const [profile, setProfile] = useState({
        hospitalName: '',
        address: '',
        city: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        latitude: null,
        longitude: null,
        profilePicture: null,
        createdAt: ''
    });
    const [originalProfile, setOriginalProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationFetched, setLocationFetched] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');

        if (userData) {
            const initialProfile = {
                hospitalName: userData.hospitalName || userData.name || '',
                address: userData.address || '',
                city: userData.city || '',
                contactPerson: userData.contactPerson || '',
                phoneNumber: userData.phoneNumber || userData.phone || '',
                email: userData.email || '',
                latitude: userData.latitude || null,
                longitude: userData.longitude || null,
                profilePicture: userData.profilePicture || null,
                createdAt: userData.createdAt || ''
            };

            setProfile(initialProfile);
            setOriginalProfile(initialProfile);
        }

        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/hospital/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(prev => ({
                    ...prev,
                    ...data
                }));
                setOriginalProfile(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const hasChanges = () => {
        return JSON.stringify(profile) !== JSON.stringify(originalProfile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hasChanges()) {
            setMessage('No changes to save');
            setMessageType('info');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/hospital/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    HospitalName: profile.hospitalName,
                    Address: profile.address,
                    City: profile.city,
                    ContactPerson: profile.contactPerson,
                    PhoneNumber: profile.phoneNumber,
                    Email: profile.email,
                    Latitude: profile.latitude,
                    Longitude: profile.longitude
                })
            });

            if (response.ok) {
                setMessage('Profile updated successfully!');
                setMessageType('success');
                setOriginalProfile({ ...profile });

                // Update localStorage
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    const updatedUser = {
                        ...userData,
                        hospitalName: profile.hospitalName,
                        name: profile.hospitalName,
                        address: profile.address,
                        city: profile.city,
                        contactPerson: profile.contactPerson,
                        phoneNumber: profile.phoneNumber,
                        phone: profile.phoneNumber,
                        email: profile.email,
                        latitude: profile.latitude,
                        longitude: profile.longitude
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    // Location functions (same as registration)
    const getCurrentLocation = async () => {
        // Same location logic as registration
        // ... (include the location functions from HospitalRegistration)
    };

    const reverseGeocode = async (lat, lng) => {
        // Same geocoding logic as registration
        // ... (include the reverse geocoding function)
    };

    const placeMarkerAtLocation = async (lat, lng) => {
        // Update profile with new location
        setProfile(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));

        await reverseGeocode(lat, lng);
        setLocationFetched(true);
    };

    // File upload functions
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File size too large. Maximum 5MB allowed.');
                setMessageType('error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setMessage('Please select an image file.');
                setMessageType('error');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPicture = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${API_BASE_URL}/auth/hospital/profile/picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(prev => ({
                    ...prev,
                    profilePicture: data.profilePicture
                }));
                setOriginalProfile(prev => ({
                    ...prev,
                    profilePicture: data.profilePicture
                }));

                // Update localStorage/sessionStorage with new profile picture
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    const updatedUser = {
                        ...userData,
                        profilePicture: data.profilePicture
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    if (sessionStorage.getItem('user')) {
                        sessionStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }

                setImagePreview(null);
                setSelectedFile(null);
                setMessage('Profile picture updated successfully!');
                setMessageType('success');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!profile.profilePicture) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/hospital/profile/picture`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setProfile(prev => ({
                    ...prev,
                    profilePicture: null
                }));
                setOriginalProfile(prev => ({
                    ...prev,
                    profilePicture: null
                }));

                // Update localStorage/sessionStorage to remove profile picture
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    const updatedUser = {
                        ...userData,
                        profilePicture: null
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    if (sessionStorage.getItem('user')) {
                        sessionStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }

                setMessage('Profile picture removed successfully!');
                setMessageType('success');
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        }
    };

    if (loading) {
        return (
            <>
                <HospitalNavbar />
                <div className="container py-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HospitalNavbar />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-white border-bottom">
                                <h2 className="h4 mb-0">Hospital Profile</h2>
                            </div>
                            <div className="card-body p-4">
                                {/* Success/Error Messages */}
                                {message && (
                                    <div className={`alert alert-${messageType === 'success' ? 'success' : messageType === 'error' ? 'danger' : 'info'} alert-dismissible fade show mb-4`} role="alert">
                                        <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : messageType === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2`}></i>
                                        {message}
                                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                                    </div>
                                )}

                                {/* Profile Picture Section */}
                                <div className="text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={imagePreview || ((profile.profilePicture && profile.profilePicture.trim() !== '') 
                                                ? `${API_BASE_URL.replace('/api', '')}${profile.profilePicture}` 
                                                : getDefaultAvatarSVG('hospital'))}
                                            alt="Hospital Profile"
                                            className="rounded-circle border border-3 border-primary"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                const defaultSrc = getDefaultAvatarSVG('hospital');
                                                if (e.target.src !== defaultSrc) {
                                                    e.target.src = defaultSrc;
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0"
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Change Profile Picture"
                                        >
                                            <i className="fas fa-camera"></i>
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    <div className="mt-3">
                                        {selectedFile && (
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    onClick={handleUploadPicture}
                                                    disabled={uploading}
                                                >
                                                    {uploading ? 'Uploading...' : 'Upload Picture'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        {profile.profilePicture && !selectedFile && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={handleRemovePicture}
                                            >
                                                <i className="fas fa-trash me-1"></i>
                                                Remove Picture
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">Hospital Name *</label>
                                            <input
                                                type="text"
                                                name="hospitalName"
                                                className="form-control"
                                                value={profile.hospitalName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Contact Person *</label>
                                            <input
                                                type="text"
                                                name="contactPerson"
                                                className="form-control"
                                                value={profile.contactPerson}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                className="form-control"
                                                value={profile.phoneNumber}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={profile.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Hospital Location</label>
                                            <p className="text-muted small mb-3">
                                                Update your hospital's location using GPS. This ensures accurate donor matching.
                                            </p>

                                            <div className="d-flex gap-2 mb-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={getCurrentLocation}
                                                    disabled={locationLoading}
                                                >
                                                    {locationLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Getting Location...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-crosshairs me-2"></i>
                                                            Update Location
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {profile.latitude && profile.longitude && (
                                                <div className="alert alert-info">
                                                    <i className="fas fa-map-marker-alt me-2"></i>
                                                    <strong>Current Location:</strong> {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address Display (Read-only) */}
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">Address</label>
                                            <textarea
                                                name="address"
                                                className="form-control"
                                                value={profile.address}
                                                readOnly
                                                rows="2"
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label fw-bold">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                className="form-control"
                                                value={profile.city}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="row">
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary me-2"
                                                disabled={saving || !hasChanges()}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setProfile({ ...originalProfile })}
                                                disabled={!hasChanges()}
                                            >
                                                Reset Changes
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HospitalProfile;