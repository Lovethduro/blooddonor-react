// Update src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import BloodDonorLanding from './components/BloodDonorLanding';
import Registration from './components/Registration';
import HospitalRegistration from './components/HospitalRegistration';
import EmergencyRegister from './components/EmergencyRegister';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Import Dashboard Components
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile';
import AdminMessages from './components/AdminMessages';
import AdminHospitalManagement from './components/AdminHospitalManagement';
import AdminAppointments from './components/AdminAppointments';
import AdminUserManagement from './components/AdminUserManagement';
import AdminNotifications from './components/AdminNotifications';
import HospitalDashboard from './components/HospitalDashboard';
import HospitalNavbar from './components/HospitalNavbar';
import HospitalContactAdmin from './components/HospitalContactAdmin';
import HospitalProfile from './components/HospitalProfile';
import HospitalAppointments from './components/HospitalAppointments';
import HospitalNotifications from './components/HospitalNotifications';
import DonorRegistration from './components/DonorRegistration';
import DonorDashboard from './components/DonorDashboard';
import DonorNavbar from './components/DonorNavbar';
import DonorProfile from './components/DonorProfile';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <BloodDonorLanding />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/hospital-register" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Registration />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/hospital-register" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <HospitalRegistration />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/donor-register" element={
                        <DonorRegistration />
                    } />
                    <Route path="/donor/dashboard" element={
                        <ProtectedRoute allowedRoles={['Donor']}>
                            <div>
                                <DonorNavbar />
                                <div className="main-content">
                                    <DonorDashboard />
                                </div>
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/donor/profile" element={
                        <ProtectedRoute allowedRoles={['Donor']}>
                            <DonorProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/emergency-register" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <EmergencyRegister />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/about" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <About />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/contact" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Contact />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/login" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <Login />
                            </main>
                            <Footer />
                        </>
                    } />
                    <Route path="/forgot-password" element={
                        <>
                            <Header />
                            <main className="main-content">
                                <ForgotPassword />
                            </main>
                            <Footer />
                        </>
                    } />

                    {/* Protected Dashboard Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin Profile Route */}
                    <Route path="/admin/profile" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminProfile />
                        </ProtectedRoute>
                    } />

                    {/* Admin Messages Route */}
                    <Route path="/admin/messages" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminMessages />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/hospitals" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminHospitalManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/appointments" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminAppointments />
                        </ProtectedRoute>
                    } />

                    {/* Admin User Management Route */}
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminUserManagement />
                        </ProtectedRoute>
                    } />

                    {/* Admin Notifications Route */}
                    <Route path="/admin/notifications" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminNotifications />
                        </ProtectedRoute>
                    } />

                    {/* Hospital Dashboard Route */}
                    <Route path="/hospital/dashboard" element={
                        <ProtectedRoute allowedRoles={['Hospital']}>
                            <HospitalDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Hospital Profile Route */}
                    <Route path="/hospital/profile" element={
                        <ProtectedRoute allowedRoles={['Hospital']}>
                           
                            <HospitalProfile />
                        </ProtectedRoute>
                    } />

                    {/* Hospital Management Routes */}
                    <Route path="/hospital/appointments" element={
                        <ProtectedRoute allowedRoles={['Hospital']}>
                            <HospitalAppointments />
                        </ProtectedRoute>
                    } />

                    <Route path="/hospital/notifications" element={
                        <ProtectedRoute allowedRoles={['Hospital']}>
                            <HospitalNotifications />
                        </ProtectedRoute>
                    } />


                    <Route path="/hospital/contact-admin" element={
                        <ProtectedRoute allowedRoles={['Hospital']}>
                            <HospitalContactAdmin />
                        </ProtectedRoute>
                    } />

                    {/* Unauthorized Route */}
                    <Route path="/unauthorized" element={
                        <div className="container-fluid py-5 bg-light min-vh-100">
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-lg">
                                            <div className="card-body text-center p-5">
                                                <i className="fas fa-lock fa-4x text-danger mb-4"></i>
                                                <h2 className="card-title mb-3">Access Denied</h2>
                                                <p className="card-text text-muted mb-4">
                                                    You don't have permission to access this resource.
                                                </p>
                                                <button 
                                                    className="btn btn-primary" 
                                                    onClick={() => window.location.href = '/login'}
                                                >
                                                    Back to Login
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;