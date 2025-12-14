// Default SVG Avatar Components
import React from 'react';

// Default Admin Avatar SVG
export const DefaultAdminAvatar = ({ size = 36, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className={className}
        style={{ borderRadius: '50%' }}
    >
        <circle cx="50" cy="50" r="50" fill="#0d3b64" />
        <circle cx="50" cy="35" r="12" fill="white" />
        <path d="M 20 75 Q 20 60 35 60 L 65 60 Q 80 60 80 75 L 80 85 L 20 85 Z" fill="white" />
    </svg>
);

// Default Hospital Avatar SVG
export const DefaultHospitalAvatar = ({ size = 36, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className={className}
        style={{ borderRadius: '50%' }}
    >
        <circle cx="50" cy="50" r="50" fill="#8b5cf6" />
        <rect x="35" y="25" width="30" height="50" rx="3" fill="white" />
        <rect x="45" y="40" width="10" height="15" fill="#8b5cf6" />
        <rect x="42" y="30" width="16" height="4" fill="#8b5cf6" />
        <circle cx="50" cy="25" r="3" fill="white" />
    </svg>
);

// Default Donor Avatar SVG
export const DefaultDonorAvatar = ({ size = 36, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className={className}
        style={{ borderRadius: '50%' }}
    >
        <circle cx="50" cy="50" r="50" fill="#e74c3c" />
        <circle cx="50" cy="35" r="12" fill="white" />
        <path d="M 20 75 Q 20 60 35 60 L 65 60 Q 80 60 80 75 L 80 85 L 20 85 Z" fill="white" />
    </svg>
);

// Generic Default Avatar SVG
export const DefaultAvatar = ({ size = 36, className = "", initial = "?" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className={className}
        style={{ borderRadius: '50%' }}
    >
        <circle cx="50" cy="50" r="50" fill="#6c757d" />
        <text 
            x="50" 
            y="50" 
            fontSize="40" 
            fill="white" 
            textAnchor="middle" 
            dominantBaseline="central"
            fontWeight="600"
        >
            {initial}
        </text>
    </svg>
);

// Helper function to get SVG data URL
export const getDefaultAvatarSVG = (type = 'default', initial = '?') => {
    const svgs = {
        admin: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#0d3b64"/>
            <circle cx="50" cy="35" r="12" fill="white"/>
            <path d="M 20 75 Q 20 60 35 60 L 65 60 Q 80 60 80 75 L 80 85 L 20 85 Z" fill="white"/>
        </svg>`,
        hospital: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#8b5cf6"/>
            <rect x="35" y="25" width="30" height="50" rx="3" fill="white"/>
            <rect x="45" y="40" width="10" height="15" fill="#8b5cf6"/>
            <rect x="42" y="30" width="16" height="4" fill="#8b5cf6"/>
            <circle cx="50" cy="25" r="3" fill="white"/>
        </svg>`,
        donor: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#e74c3c"/>
            <circle cx="50" cy="35" r="12" fill="white"/>
            <path d="M 20 75 Q 20 60 35 60 L 65 60 Q 80 60 80 75 L 80 85 L 20 85 Z" fill="white"/>
        </svg>`,
        default: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#6c757d"/>
            <text x="50" y="50" fontSize="40" fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="600">${initial}</text>
        </svg>`
    };
    
    const svg = svgs[type] || svgs.default;
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml,${encoded}`;
};

