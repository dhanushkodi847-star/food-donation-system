import { Link } from 'react-router-dom';
import { FiHeart, FiUsers, FiShield, FiTruck, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { MdFoodBank, MdVolunteerActivism } from 'react-icons/md';
import './Landing.css';

const Landing = () => {
  const features = [
    { icon: <MdVolunteerActivism />, title: 'Easy Donation', desc: 'List surplus food in seconds with our intuitive donation form.' },
    { icon: <FiUsers />, title: 'Role-Based Access', desc: 'Separate dashboards for donors, receivers, and administrators.' },
    { icon: <FiShield />, title: 'Secure Platform', desc: 'JWT authentication and role-based authorization for data security.' },
    { icon: <FiTruck />, title: 'Lifecycle Tracking', desc: 'Track donations from listing to delivery with real-time status.' },
    { icon: <FiHeart />, title: 'Zero Waste', desc: 'Reduce food waste by connecting donors with those in need.' },
    { icon: <FiCheckCircle />, title: 'Verified Receivers', desc: 'Organizations are verified to ensure food reaches the right hands.' },
  ];

  const steps = [
    { num: '01', title: 'Register', desc: 'Sign up as a donor or receiver with your details.' },
    { num: '02', title: 'List / Browse Food', desc: 'Donors list surplus food; receivers browse available donations.' },
    { num: '03', title: 'Request & Accept', desc: 'Receivers request food; donors review and accept requests.' },
    { num: '04', title: 'Deliver & Track', desc: 'Track pickup and delivery. Food reaches those in need!' },
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in">
            <div className="hero-badge">
              <MdFoodBank /> Food Donation Management System
            </div>
            <h1>
              Share Food,<br />
              <span className="gradient-text">Share Hope</span>
            </h1>
            <p className="hero-subtitle">
              Bridge the gap between food surplus and hunger. Our platform connects 
              generous donors with verified receivers, ensuring no food goes to waste.
            </p>
            <div className="hero-buttons">
              <Link to="/register/donor" className="btn btn-primary btn-lg">
                Donate Food <FiArrowRight />
              </Link>
              <Link to="/register/receiver" className="btn btn-secondary btn-lg">
                Receive Food
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">100+</span>
                <span className="hero-stat-label">Donations Made</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">50+</span>
                <span className="hero-stat-label">Active Donors</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">30+</span>
                <span className="hero-stat-label">Organizations</span>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-slide-right">
            <div className="hero-card-stack">
              <div className="hero-floating-card hfc-1">
                <span className="hfc-emoji">🍲</span>
                <span>Cooked Meals</span>
              </div>
              <div className="hero-floating-card hfc-2">
                <span className="hfc-emoji">🥬</span>
                <span>Fresh Produce</span>
              </div>
              <div className="hero-floating-card hfc-3">
                <span className="hfc-emoji">📦</span>
                <span>Packaged Food</span>
              </div>
              <div className="hero-floating-card hfc-4">
                <span className="hfc-emoji">🍞</span>
                <span>Bakery Items</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header animate-fade-in">
            <span className="section-badge">Features</span>
            <h2>Why Choose <span className="gradient-text">FoodShare</span>?</h2>
            <p>A comprehensive platform designed to make food donation seamless and impactful.</p>
          </div>
          <div className="features-grid stagger-children">
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-fade-in">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header animate-fade-in">
            <span className="section-badge">Process</span>
            <h2>How It <span className="gradient-text">Works</span></h2>
            <p>Four simple steps to make a difference in someone&apos;s life.</p>
          </div>
          <div className="steps-grid stagger-children">
            {steps.map((s, i) => (
              <div key={i} className="step-card animate-fade-in">
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card animate-scale-in">
            <h2>Ready to Make a <span className="gradient-text">Difference</span>?</h2>
            <p>Join our community of donors and receivers. Every meal shared is a life touched.</p>
            <div className="cta-buttons">
              <Link to="/register/donor" className="btn btn-primary btn-lg">
                Start Donating <FiArrowRight />
              </Link>
              <Link to="/register/receiver" className="btn btn-accent btn-lg">
                Register as Receiver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
