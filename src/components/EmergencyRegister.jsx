import React from 'react';
import { Link } from 'react-router-dom';

const EmergencyRegister = () => {
    return (
        <div className="container py-5">
            <div className="alert alert-danger">
                <h2>🚨 Emergency Blood Donation Needed</h2>
                <p className="lead">Urgent requirement for blood donors. Your donation can save lives immediately!</p>
                <Link to="/register" className="btn btn-danger btn-lg">
                    Register as Emergency Donor
                </Link>
            </div>
        </div>
    );
};

export default EmergencyRegister;
