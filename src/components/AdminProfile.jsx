import React, { useState, useEffect, useRef } from 'react';
import AdminNavbar from './AdminNavbar';
import { getDefaultAvatarSVG } from './DefaultAvatars';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        adminLevel: '',
        permissions: [],
        profilePicture: null,
        createdAt: ''
    });
    const [originalProfile, setOriginalProfile] = useState(null); // Store original data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [imagePreview, setImagePreview] = useState(null); // For upload preview
    const [selectedFile, setSelectedFile] = useState(null); // Store selected file
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Pre-populate with localStorage data immediately
        const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        
        if (userData) {
            const initialProfile = {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role || '',
                adminLevel: userData.adminLevel || '',
                permissions: userData.permissions || [],
                profilePicture: userData.profilePicture || null,
                createdAt: userData.createdAt || ''
            };
            
            setProfile(initialProfile);
            setOriginalProfile(initialProfile); // Store original data
        }
        
        // Then fetch latest data from server
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            const response = await fetch('http://localhost:5004/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(prev => ({
                    ...prev,
                    ...data // Update with server data
                }));
                setOriginalProfile(data); // Update original data
            } else {
                // If server fails, keep localStorage data
                console.warn('Failed to fetch profile from server, using cached data');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Keep localStorage data on error
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setImagePreview(null);
            setSelectedFile(null);
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setMessage('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            setMessageType('error');
            setImagePreview(null);
            setSelectedFile(null);
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setMessage('File size too large. Maximum size is 2MB.');
            setMessageType('error');
            setImagePreview(null);
            setSelectedFile(null);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        setSelectedFile(file);
        setMessage(''); // Clear any previous messages
    };

    const handleUploadPicture = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('http://localhost:5004/api/admin/profile/picture', {
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
                setMessage('Profile picture uploaded successfully!');
                setMessageType('success');
                setImagePreview(null); // Clear preview
                setSelectedFile(null); // Clear selected file

                // Update stored user data
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    userData.profilePicture = data.profilePicture;
                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(userData));
                    }
                }
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to upload profile picture');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            setMessage('Error uploading profile picture');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setMessage('');
    };

    const handleRemovePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            const response = await fetch('http://localhost:5004/api/admin/profile/picture', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setProfile(prev => ({
                    ...prev,
                    profilePicture: null
                }));
                setMessage('Profile picture removed successfully!');
                setMessageType('success');

                // Update stored user data
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    userData.profilePicture = null;
                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(userData));
                    }
                }
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to remove profile picture');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error removing profile picture:', error);
            setMessage('Error removing profile picture');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('user')?.token;
            
            const response = await fetch('http://localhost:5004/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone
                })
            });

            if (response.ok) {
                setMessage('Profile updated successfully!');
                setMessageType('success');
                setOriginalProfile(profile); // Update original data
                
                // Update stored user data
                const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
                if (userData) {
                    userData.name = profile.name;
                    userData.phone = profile.phone;
                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(userData));
                    }
                }
            } else {
                const error = await response.json();
                setMessage(error.message || 'Failed to update profile');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile');
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    // Check if profile has unsaved changes
    const hasUnsavedChanges = () => {
        if (!originalProfile) return false;
        return profile.name !== originalProfile.name || profile.phone !== originalProfile.phone;
    };

    if (loading) {
        return (
            <div>
                <AdminNavbar />
                <div className="container py-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AdminNavbar />

            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h4 className="card-title mb-0">
                                    <i className="fas fa-user-cog me-2"></i>Admin Profile
                                </h4>
                            </div>

                            <div className="card-body p-4">
                                {message && (
                                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
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
                                                : getDefaultAvatarSVG('admin'))} 
                                            alt="Profile" 
                                            className="rounded-circle border border-3 border-primary"
                                            style={{width: '120px', height: '120px', objectFit: 'cover'}}
                                            onError={(e) => {
                                                const defaultSrc = getDefaultAvatarSVG('admin');
                                                if (e.target.src !== defaultSrc) {
                                                    e.target.src = defaultSrc;
                                                }
                                            }}
                                        />
                                        
                                        {uploading && (
                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Uploading...</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {imagePreview && (
                                            <div className="position-absolute top-0 end-0">
                                                <span className="badge bg-success">Preview</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        {!imagePreview ? (
                                            <>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                    accept="image/jpeg,image/png,image/gif"
                                                    className="d-none"
                                                />
                                                
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                >
                                                    <i className="fas fa-camera me-1"></i>
                                                    Choose Picture
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={handleUploadPicture}
                                                    disabled={uploading}
                                                >
                                                    <i className="fas fa-upload me-1"></i>
                                                    {uploading ? 'Uploading...' : 'Upload Picture'}
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm me-2"
                                                    onClick={handleCancelUpload}
                                                    disabled={uploading}
                                                >
                                                    <i className="fas fa-times me-1"></i>
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {profile.profilePicture && !imagePreview && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={handleRemovePicture}
                                                disabled={uploading}
                                            >
                                                <i className="fas fa-trash me-1"></i>
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    
                                    <small className="text-muted d-block mt-2">
                                        JPEG, PNG, or GIF. Max 2MB.
                                        {imagePreview && <strong className="text-success ms-2">Preview ready to upload!</strong>}
                                    </small>
                                </div>

                                {/* Profile Information Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={profile.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control bg-light"
                                                value={profile.email}
                                                readOnly
                                            />
                                            <small className="text-muted">Email cannot be changed</small>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phone"
                                                value={profile.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Admin Level</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile.adminLevel}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-bold">Permissions</label>
                                            <div className="border rounded p-3 bg-light">
                                                {profile.permissions && profile.permissions.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {profile.permissions.map((permission, index) => (
                                                            <span key={index} className="badge bg-primary">
                                                                {permission.replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">No permissions assigned</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-bold">Account Created</label>
                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        {hasUnsavedChanges() && (
                                            <small className="text-warning me-3">
                                                <i className="fas fa-exclamation-triangle me-1"></i>
                                                You have unsaved changes
                                            </small>
                                        )}
                                        
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving || !hasUnsavedChanges()}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-1"></i>
                                                    Save Changes
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

            {/* Footer */}
            <footer className="bg-white border-top py-4 mt-auto">
                <div className="container text-center text-muted">
                    <p className="mb-0">
                        &copy; {new Date().getFullYear()} Blood Connect — 
                        <strong>Administrative System</strong>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdminProfile;
