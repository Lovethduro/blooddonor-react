// src/components/BloodDonorLanding.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BloodDonorLanding.css';

const BloodDonorLanding = () => {
    const [showAlert, setShowAlert] = useState(true);

    // Fun Facts Data
    const funFacts = [
        {
            number: "1",
            title: "Pint Donated",
            description: "Just 45-60 minutes of your time",
            icon: "fa-tint",
            color: "#0d3b64",
            borderColor: "#ff6b6b",
            iconColor: "text-danger"
        },
        {
            number: "3",
            title: "Lives Saved",
            description: "That's a whole family!",
            icon: "fa-users",
            color: "#355677",
            borderColor: "#feca57",
            iconColor: "text-warning"
        },
        {
            number: "FREE",
            title: "Snacks & Juice",
            description: "The best part!",
            icon: "fa-cookie-bite",
            color: "#5a7a9a",
            borderColor: "#48dbfb",
            iconColor: "text-info"
        },
        {
            number: "HERO",
            title: "Status Achieved",
            description: "Bragging rights included",
            icon: "fa-star",
            color: "#b8ccd0",
            borderColor: "#1dd1a1",
            iconColor: "text-success",
            textColor: "#0d3b64"
        }
    ];

    // Testimonials Data
    const testimonials = [
        {
            name: "Sarah M.",
            image: "/images/Sarah.jpg",
            quote: "I've donated 15 times! The staff makes you feel like a true hero every single time.",
            bloodType: "O+ Donor",
            donations: "15 donations"
        },
        {
            name: "James T.",
            image: "/images/james.jpg",
            quote: "My first time was so easy! The free cookies were delicious and I saved 3 lives!",
            bloodType: "B- Donor",
            donations: "3 donations"
        },
        {
            name: "Maria L.",
            image: "/images/maria.jpg",
            quote: "As AB+, my plasma helps so many people. It's the most rewarding 45 minutes of my month!",
            bloodType: "AB+ Donor",
            donations: "12 donations"
        }
    ];

    // Blood Type Cards
    const bloodTypes = [
        {
            type: "O Negative",
            icon: "fa-bolt",
            title: "UNIVERSAL DONOR",
            description: "The emergency superhero! Can save ANYONE, anytime. Always in high demand for trauma cases.",
            color: "#0d3b64",
            borderColor: "#e74c3c",
            iconColor: "text-warning"
        },
        {
            type: "AB Positive",
            icon: "fa-shield-alt",
            title: "UNIVERSAL RECEIVER",
            description: "The plasma powerhouse! Your plasma can be given to patients of any blood type.",
            color: "#355677",
            borderColor: "#3498db",
            iconColor: "text-info"
        },
        {
            type: "All Types Rock!",
            icon: "fa-star",
            title: "EVERYONE'S NEEDED",
            description: "No small roles in saving lives! Every blood type has patients waiting just for you.",
            color: "#5a7a9a",
            borderColor: "#f39c12",
            iconColor: "text-warning"
        }
    ];

    // Impact Images
    const impactImages = [
        {
            image: "/images/baby.jpg",
            title: "Newborns & Infants",
            description: "Your donation helps premature babies and infants in critical care"
        },
        {
            image: "/images/accident.jpg",
            title: "Emergency Patients",
            description: "Trauma victims rely on immediate blood availability"
        },
        {
            image: "/images/cancer.jpg",
            title: "Cancer Patients",
            description: "Chemotherapy patients need regular blood transfusions"
        }
    ];

    // Process Steps
    const processSteps = [
        {
            number: 1,
            icon: "fa-clipboard-check",
            title: "Quick Registration",
            description: "Easy sign-up & health questionnaire. Faster than ordering coffee!",
            gradient: "linear-gradient(45deg, #0d3b64, #355677)",
            borderColor: "#ff6b6b",
            iconColor: "text-primary"
        },
        {
            number: 2,
            icon: "fa-tint",
            title: "Comfy Donation",
            description: "Relax for 8-10 minutes while watching TV or scrolling your phone.",
            gradient: "linear-gradient(45deg, #355677, #5a7a9a)",
            borderColor: "#feca57",
            iconColor: "text-danger"
        },
        {
            number: 3,
            icon: "fa-cookie-bite",
            title: "Snack & Celebrate",
            description: "Enjoy treats, get your hero bandage, and feel amazing!",
            gradient: "linear-gradient(45deg, #5a7a9a, #b8ccd0)",
            borderColor: "#1dd1a1",
            iconColor: "text-warning"
        }
    ];

    // Benefits
    const benefits = [
        {
            icon: "fa-heartbeat",
            iconColor: "text-danger",
            title: "Free Health Checkup",
            description: "Get a mini physical - pulse, blood pressure, hemoglobin levels. It's like a checkup with cookies!"
        },
        {
            icon: "fa-cookie-bite",
            iconColor: "text-warning",
            title: "VIP Snack Treatment",
            description: "Enjoy premium cookies and juice while we pamper you. You've earned it, hero!"
        },
        {
            icon: "fa-award",
            iconColor: "text-info",
            title: "Instant Hero Status",
            description: "Walk out with a cool bandage and the knowledge you just saved lives. #Winning"
        }
    ];

    return (
        <div className="blood-donor-landing">
            {/* HERO SECTION */}
            <section className="hero-section text-center py-5 text-white">
                <div className="container py-5">
                    <div className="hero-badge mb-4">
                        <span className="badge bg-danger fs-6 px-4 py-2 rounded-pill animate-pulse">
                            <i className="fas fa-bolt me-2"></i>URGENT: Donors Needed
                        </span>
                    </div>

                    <h1 className="display-4 fw-bold mb-4">
                        Be a <span className="text-warning">Hero</span>. Save <span className="text-danger">Lives</span>.
                    </h1>
                    <p className="lead fs-3 mb-4">
                        Your 1 hour = 3 lives saved. <strong className="text-warning">That's superhero math!</strong>
                    </p>

                    <div className="heart-container">
                        <div className="hero-icon">
                            <i className="fas fa-heartbeat fa-5x mb-4" style={{ color: '#ff6b6b' }}></i>
                        </div>
                    </div>

                   
                </div>
            </section>

            {/* FUN FACTS */}
            <section id="fun-facts" className="container my-5 py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: '#0d3b64' }}>
                        The <span className="text-danger">Amazing</span> Impact of Your Donation
                    </h2>
                    <p className="lead text-muted">Real superheroes don't wear capes - they wear bandages!</p>
                </div>

                <div className="row text-center g-4">
                    {funFacts.map((fact, index) => (
                        <div className="col-md-3" key={index}>
                            <div
                                className="p-4 rounded-3 text-white shadow-lg position-relative"
                                style={{
                                    background: fact.color,
                                    borderBottom: `4px solid ${fact.borderColor}`,
                                    color: fact.textColor || 'white'
                                }}
                            >
                                <div className="fact-icon mb-3">
                                    <i className={`fas ${fact.icon} fa-2x ${fact.iconColor}`}></i>
                                </div>
                                <h2 className="display-4 fw-bold">{fact.number}</h2>
                                <p className="fs-5 fw-bold">{fact.title}</p>
                                <small>{fact.description}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY IT'S AWESOME */}
            <section className="py-5 my-5" style={{ background: '#f8f9fa' }}>
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div className="text-center">
                                <div className="image-container">
                                    <img
                                        src="/images/Process.jpg"
                                        alt="Comfortable and modern blood donation process"
                                        className="img-fluid rounded-3 shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h2 className="fw-bold mb-4" style={{ color: '#0d3b64' }}>
                                Why You'll <span className="text-danger">Love</span> Donating
                            </h2>

                            {benefits.map((benefit, index) => (
                                <div className="benefit-card p-4 rounded-3 mb-4 bg-white shadow-sm" key={index}>
                                    <div className="d-flex align-items-center">
                                        <div className="benefit-icon me-4">
                                            <i className={`fas ${benefit.icon} fa-2x ${benefit.iconColor}`}></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold" style={{ color: '#355677' }}>{benefit.title}</h5>
                                            <p className="text-muted mb-0">{benefit.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Link
                                to="/register"
                                className="btn btn-danger btn-lg px-5 rounded-pill fw-bold shadow"
                                style={{
                                    background: 'linear-gradient(45deg, #e74c3c, #ff6b6b)',
                                    border: 'none'
                                }}
                            >
                                I Want These Perks!
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="container my-5 py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: '#0d3b64' }}>
                        Real Heroes, <span className="text-danger">Real Stories</span>
                    </h2>
                    <p className="lead text-muted">Hear from our amazing blood donors</p>
                </div>

                <div className="row g-4">
                    {testimonials.map((testimonial, index) => (
                        <div className="col-md-4" key={index}>
                            <div className="card border-0 shadow-lg h-100 text-center hover-lift">
                                <div className="card-body p-4">
                                    <img
                                        src={testimonial.image}
                                        alt={`${testimonial.name} - blood donor`}
                                        className="rounded-circle mx-auto mb-3 donor-photo"
                                    />
                                    <h5 className="fw-bold" style={{ color: '#0d3b64' }}>{testimonial.name}</h5>
                                    <p className="text-muted">"{testimonial.quote}"</p>
                                    <div className="text-warning">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <small className="text-muted">{testimonial.bloodType} • {testimonial.donations}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BLOOD TYPE SUPERHEROES */}
            <section className="container my-5 py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: '#0d3b64' }}>
                        Your Blood Type = Your <span className="text-danger">Superpower</span>
                    </h2>
                    <p className="lead text-muted">Every blood type has unique life-saving abilities</p>
                </div>

                <div className="row g-4 justify-content-center">
                    {bloodTypes.map((bloodType, index) => (
                        <div className="col-md-4" key={index}>
                            <div className="card border-0 shadow-lg h-100 hover-lift">
                                <div
                                    className="card-header text-white text-center py-4"
                                    style={{
                                        background: bloodType.color,
                                        borderBottom: `4px solid ${bloodType.borderColor}`
                                    }}
                                >
                                    <i className={`fas ${bloodType.icon} fa-3x mb-3 ${bloodType.iconColor}`}></i>
                                    <h4 className="fw-bold">{bloodType.type}</h4>
                                </div>
                                <div className="card-body text-center p-4">
                                    <span
                                        className={`badge fs-6 mb-3 ${index === 0 ? 'bg-danger' : index === 1 ? 'bg-info' : 'bg-warning text-dark'}`}
                                    >
                                        {bloodType.title}
                                    </span>
                                    <p className="text-muted">{bloodType.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* IMPACT VISUALIZATION */}
            <section className="py-5 my-5" style={{ background: 'linear-gradient(135deg, #0d3b64 0%, #355677 100%)' }}>
                <div className="container text-center text-white">
                    <h2 className="fw-bold mb-5">See Your <span className="text-warning">Impact</span> in Action</h2>

                    <div className="row g-4">
                        {impactImages.map((impact, index) => (
                            <div className="col-md-4" key={index}>
                                <div className="impact-card">
                                    <img
                                        src={impact.image}
                                        alt={impact.title}
                                        className="img-fluid rounded-3 mb-3 impact-image"
                                    />
                                    <h5>{impact.title}</h5>
                                    <p>{impact.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5">
                        <a
                            href="#fun-facts"
                            className="btn btn-warning btn-lg px-5 rounded-pill fw-bold"
                        >
                            <i className="fas fa-chart-line me-2"></i>See More Impact Stats
                        </a>
                    </div>
                </div>
            </section>

            {/* EMERGENCY ALERT */}
            {showAlert && (
                <section className="text-center py-5 my-5 text-white emergency-alert">
                    <div className="container">
                        <div className="alert-pulse mb-4">
                            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        </div>
                        <h2 className="fw-bold mb-3">🚨 <span className="text-warning">CODE RED</span> ALERT 🚨</h2>
                        <p className="fs-3 mb-4">We're facing a critical blood shortage. <strong>Real heroes needed NOW!</strong></p>

                        <div className="row justify-content-center mb-4">
                            <div className="col-md-8">
                                <div className="alert alert-warning alert-dismissible fade show rounded-pill shadow" role="alert">
                                    <i className="fas fa-skull-crossbones me-2"></i>
                                    <strong>CRITICAL LEVELS:</strong> O- and B- supplies at emergency lows
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAlert(false)}
                                    ></button>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            <Link
                                to="/emergency-register"
                                className="btn btn-warning btn-lg px-5 rounded-pill fw-bold shadow-lg text-dark"
                            >
                                <i className="fas fa-fire me-2"></i>EMERGENCY SIGN-UP
                            </Link>

                            <button className="btn btn-outline-light btn-lg px-4 rounded-pill fw-bold">
                                <i className="fas fa-share-alt me-2"></i>Share the Mission
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* PROCESS STEPS */}
            <section className="container my-5 py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: '#0d3b64' }}>
                        Super-Simple <span className="text-danger">3-Step</span> Hero Journey
                    </h2>
                </div>

                <div className="row g-4">
                    {processSteps.map((step, index) => (
                        <div className="col-md-4 text-center" key={index}>
                            <div className="step-card p-4 rounded-3 bg-white shadow position-relative">
                                <div
                                    className="step-number rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: step.gradient,
                                        color: step.textColor || 'white',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        border: `4px solid ${step.borderColor}`
                                    }}
                                >
                                    {step.number}
                                </div>
                                <i className={`fas ${step.icon} fa-3x mb-3 ${step.iconColor}`}></i>
                                <h5 style={{ color: '#355677' }}>{step.title}</h5>
                                <p className="text-muted">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FINAL HERO CALL */}
            <section className="text-center py-5 rounded-4 mb-5 final-hero-call">
                <div className="container">
                    <div className="hero-sparkle mb-4">
                        <i className="fas fa-sparkles fa-2x text-warning me-3"></i>
                        <i className="fas fa-crown fa-2x text-warning"></i>
                        <i className="fas fa-sparkles fa-2x text-warning ms-3"></i>
                    </div>

                    <h1 className="fw-bold mb-4" style={{ color: '#0d3b64' }}>
                        Ready to Join the <span className="text-danger">League of Extraordinary</span> Lifesavers?
                    </h1>
                    <p className="fs-4 mb-4 text-muted">
                        Thousands of awesome people are already saving lives. Your turn, hero!
                    </p>

                    <div className="d-flex justify-content-center">
                        <Link
                            to="/register"
                            className="btn btn-danger fw-bold shadow-lg rounded-pill hero-btn"
                            style={{
                                background: 'linear-gradient(45deg, #e74c3c, #ff6b6b, #e74c3c)',
                                border: 'none',
                                fontSize: '1.5rem',
                                padding: '20px 40px',
                                minWidth: '400px',
                                whiteSpace: 'nowrap',
                                backgroundSize: '200% auto',
                                transition: '0.5s'
                            }}
                        >
                            🚀 YES! MAKE ME A HERO! 🚀
                        </Link>
                    </div>

                    <div className="mt-4">
                        <small className="text-muted">
                            <i className="fas fa-bolt text-warning me-1"></i>
                            Quick registration • Professional staff • Life-saving impact
                        </small>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BloodDonorLanding;