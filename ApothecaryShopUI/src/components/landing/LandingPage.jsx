import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import AuthModal from './AuthModal';
import './LandingPage.css';
import theratraceHeroPreview from '../../assets/theratrace_hero_preview.png';

const FadeInSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const [searchParams] = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check URL search params on mount
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'register') {
      setAuthModalMode(authParam);
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  // Navbar scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuthModal = useCallback((mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="landing-page">

      {/* ===== NAVBAR ===== */}
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => scrollToSection('hero')}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="theratrace-logo-svg">
              <g className="logo-hex-group">
                <polygon points="18,4 30,11 30,25 18,32 6,25 6,11" stroke="var(--sage)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="18" cy="4" r="2.5" fill="var(--copper)" />
                <circle cx="30" cy="11" r="2.5" fill="var(--teal)" />
                <circle cx="30" cy="25" r="2.5" fill="var(--teal)" />
                <circle cx="18" cy="32" r="2.5" fill="var(--copper)" />
                <circle cx="6" cy="25" r="2.5" fill="var(--teal)" />
                <circle cx="6" cy="11" r="2.5" fill="var(--teal)" />
              </g>
              <path d="M18,9 C22.5,13.5 24,19 18,26 C12,19 13.5,13.5 18,9 Z" fill="var(--sage)" opacity="0.85" className="logo-leaf-path" />
              <path d="M18,26 L18,13" stroke="#F5F7F4" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>AushadhSanchaya</span>
          </div>

          <div className="landing-nav-links">
            <a onClick={() => scrollToSection('about')}>Concept</a>
            <a onClick={() => scrollToSection('why')}>Why AushadhSanchaya</a>
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('reviews')}>Reviews</a>
            <a onClick={() => scrollToSection('contact')}>Contact</a>
          </div>

          <div className="landing-nav-auth">
            <button className="landing-nav-btn-ghost" onClick={() => openAuthModal('login')}>Sign In</button>
            <button className="landing-nav-btn-solid" onClick={() => openAuthModal('register')}>Get Started</button>
          </div>

          <button className="landing-nav-mobile-toggle" onClick={() => setMobileMenuOpen((prev) => !prev)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`landing-nav-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
          <a onClick={() => scrollToSection('about')}>Concept</a>
          <a onClick={() => scrollToSection('why')}>Why AushadhSanchaya</a>
          <a onClick={() => scrollToSection('features')}>Features</a>
          <a onClick={() => scrollToSection('reviews')}>Reviews</a>
          <a onClick={() => scrollToSection('contact')}>Contact</a>
          <div className="landing-nav-mobile-auth">
            <button className="landing-nav-btn-ghost" onClick={() => openAuthModal('login')}>Sign In</button>
            <button className="landing-nav-btn-solid" onClick={() => openAuthModal('register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-bg">
          {/* Continuous rotating molecular crystal lattice SVG */}
          <svg className="svg-molecule-1 animate-spin-slow" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="20" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <circle cx="95" cy="40" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <circle cx="95" cy="80" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <circle cx="60" cy="100" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <circle cx="25" cy="80" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <circle cx="25" cy="40" r="5" stroke="var(--sage)" strokeWidth="1.5" opacity="0.25" />
            <line x1="60" y1="20" x2="95" y2="40" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <line x1="95" y1="40" x2="95" y2="80" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <line x1="95" y1="80" x2="60" y2="100" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <line x1="60" y1="100" x2="25" y2="80" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <line x1="25" y1="80" x2="25" y2="40" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <line x1="25" y1="40" x2="60" y2="20" stroke="var(--sage)" strokeWidth="1.2" opacity="0.2" />
            <circle cx="60" cy="60" r="10" stroke="var(--copper)" strokeWidth="1" opacity="0.15" />
            <line x1="60" y1="20" x2="60" y2="50" stroke="var(--copper)" strokeWidth="0.8" opacity="0.1" />
            <line x1="60" y1="100" x2="60" y2="70" stroke="var(--copper)" strokeWidth="0.8" opacity="0.1" />
          </svg>

          {/* Continuous floating simple molecule */}
          <svg className="svg-molecule-2 animate-float-slow" width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="20" cy="40" r="4" stroke="var(--copper)" strokeWidth="1.5" opacity="0.2" />
            <circle cx="50" cy="20" r="4" stroke="var(--copper)" strokeWidth="1.5" opacity="0.2" />
            <circle cx="50" cy="60" r="4" stroke="var(--copper)" strokeWidth="1.5" opacity="0.2" />
            <line x1="20" y1="40" x2="50" y2="20" stroke="var(--copper)" strokeWidth="1" opacity="0.15" />
            <line x1="20" y1="40" x2="50" y2="60" stroke="var(--copper)" strokeWidth="1" opacity="0.15" />
            <line x1="50" y1="20" x2="50" y2="60" stroke="var(--copper)" strokeWidth="1" opacity="0.15" />
          </svg>

          {/* DNA Helix: Continuous stroke path tracing animation */}
          <svg className="svg-helix" width="60" height="300" viewBox="0 0 60 300" fill="none">
            <path
              d="M10,10 C10,30 50,30 50,50 C50,70 10,70 10,90 C10,110 50,110 50,130 C50,150 10,150 10,170 C10,190 50,190 50,210 C50,230 10,230 10,250 C10,270 50,270 50,290"
              stroke="var(--sage)" strokeWidth="1.5" opacity="0.15" fill="none"
              strokeDasharray="600" strokeDashoffset="600"
              className="trace-line-path"
            />
            <path
              d="M50,10 C50,30 10,30 10,50 C10,70 50,70 50,90 C50,110 10,110 10,130 C10,150 50,150 50,170 C50,190 10,190 10,210 C10,230 50,230 50,250 C50,270 10,270 10,290"
              stroke="var(--sage)" strokeWidth="1.5" opacity="0.1" fill="none"
              strokeDasharray="600" strokeDashoffset="600"
              className="trace-line-path-delay"
            />
          </svg>

          {/* Botanical leaf line art: Continuous draw animation */}
          <svg className="svg-leaf-line" width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path
              d="M100,180 Q100,100 60,40 Q80,80 100,60 Q120,80 140,40 Q100,100 100,180Z"
              stroke="var(--sage)" strokeWidth="1" opacity="0.12" fill="none"
              strokeDasharray="400" strokeDashoffset="400"
              className="draw-leaf-path"
            />
            <line x1="100" y1="180" x2="100" y2="60" stroke="var(--sage)" strokeWidth="0.8" opacity="0.1" />
          </svg>
        </div>

        <div className="landing-hero-container">
          <div className="landing-hero-grid">
            <div className="landing-hero-text-side">
              <FadeInSection>
                <h1>Clinical Sourcing &amp; <span className="highlight">Traceability Ledger</span></h1>
              </FadeInSection>
              <FadeInSection delay={0.15}>
                <p className="landing-hero-subtitle">
                  From bulk procurement to patient dispensing — maintain absolute compliance, FEFO batch-level tracking, and AI-powered stock audits on an immutable pharmacy ledger.
                </p>
              </FadeInSection>
              <FadeInSection delay={0.3}>
                <div className="landing-hero-cta">
                  <button className="landing-hero-btn-primary" onClick={() => openAuthModal('register')}>Initialize Ledger</button>
                  <button className="landing-hero-btn-secondary" onClick={() => scrollToSection('features')}>Explore Architecture →</button>
                </div>
              </FadeInSection>
              <FadeInSection delay={0.45}>
                <div className="landing-hero-stats">
                  <div className="landing-hero-stat">
                    <span className="landing-hero-stat-number">100%</span>
                    <span className="landing-hero-stat-label">Audit Accuracy</span>
                  </div>
                  <div className="landing-hero-stat">
                    <span className="landing-hero-stat-number">FEFO</span>
                    <span className="landing-hero-stat-label">Stock Sourcing</span>
                  </div>
                  <div className="landing-hero-stat">
                    <span className="landing-hero-stat-number">0%</span>
                    <span className="landing-hero-stat-label">Expiry Leaks</span>
                  </div>
                </div>
              </FadeInSection>
            </div>
            <div className="landing-hero-visual-side">
              <FadeInSection delay={0.25}>
                <div className="landing-hero-img-wrapper">
                  {/* Dashboard image with continuous slow breathing zoom & soft pulse glow */}
                  <img src={theratraceHeroPreview} alt="AushadhSanchaya Ledger Interface" className="theratrace-hero-image" />
                  <div className="hero-copper-glow"></div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONCEPT SECTION ===== */}
      <section className="landing-section landing-about" id="about">
        <FadeInSection>
          <div className="landing-section-header">
            <span className="landing-section-label">The Concept</span>
            <h2 className="landing-section-title">The Pharmacy Ledger, Perfected</h2>
            <p className="landing-section-desc">
              AushadhSanchaya merges organic botanical healthcare origins with strict, modern clinical science. We believe pharmacy inventory shouldn't just be tracked, but audited immutably.
            </p>
          </div>
        </FadeInSection>
        <div className="landing-about-grid">
          <FadeInSection delay={0.1}>
            <div className="landing-about-visual">
              {/* Continuous animated laboratory compounding flask SVG */}
              <svg width="400" height="350" viewBox="0 0 400 350" fill="none" className="compounding-flask-svg">
                {/* Flask Outline */}
                <path d="M170,80 L230,80 L230,130 L290,250 A30,30 0 0,1 260,295 L140,295 A30,30 0 0,1 110,250 L170,130 Z" stroke="var(--slate)" strokeWidth="2.5" fill="none" opacity="0.3" />
                {/* Lip of flask */}
                <ellipse cx="200" cy="80" rx="32" ry="6" stroke="var(--slate)" strokeWidth="2.5" fill="none" opacity="0.3" />
                {/* Liquid fill */}
                <path d="M140,200 L260,200 L280,245 A20,20 0 0,1 260,290 L140,290 A20,20 0 0,1 120,245 Z" fill="var(--sage)" fillOpacity="0.12" stroke="var(--sage)" strokeWidth="1" className="flask-liquid-path" />
                {/* Bubbles floating inside the liquid */}
                <circle cx="160" cy="270" r="4" fill="var(--teal)" opacity="0.4" className="bubble bubble-1" />
                <circle cx="240" cy="260" r="3" fill="var(--teal)" opacity="0.3" className="bubble bubble-2" />
                <circle cx="190" cy="280" r="5" fill="var(--copper)" opacity="0.4" className="bubble bubble-3" />
                <circle cx="210" cy="230" r="2.5" fill="var(--teal)" opacity="0.35" className="bubble bubble-4" />
                <circle cx="175" cy="245" r="4.5" fill="var(--copper)" opacity="0.3" className="bubble bubble-5" />
                {/* Molecule floating in background */}
                <circle cx="310" cy="110" r="3.5" stroke="var(--copper)" strokeWidth="1.5" opacity="0.2" />
                <circle cx="340" cy="130" r="3.5" stroke="var(--copper)" strokeWidth="1.5" opacity="0.2" />
                <line x1="310" y1="110" x2="340" y2="130" stroke="var(--copper)" strokeWidth="1.2" opacity="0.15" />
              </svg>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div className="landing-about-text">
              <p>
                Standard retail point-of-sale systems fail under the strict regulatory requirements of pharmacy control. When managing antibiotics, cold-chain vaccines, or scheduled substances, minor errors in data entry can lead to regulatory fines or compromised patient safety.
              </p>
              <p>
                AushadhSanchaya handles the full lifecycle of pharmaceutical products. It tracks batches, manages procurement from certified manufacturers, and monitors the distribution flow across clinics, internal departments, and patients.
              </p>
              <p>
                Every transaction and adjustment is written as an immutable ledger record, guaranteeing historical trace integrity. Your organization gets comprehensive FEFO (First-Expired, First-Out) dispatch suggestions and AI-driven stock-out warnings before shortages occur.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== WHY THIS PLATFORM ===== */}
      <section className="landing-section landing-why" id="why">
        <FadeInSection>
          <div className="landing-section-header">
            <span className="landing-section-label">Compliance Sourcing</span>
            <h2 className="landing-section-title">Why Settle for Standard Inventory?</h2>
            <p className="landing-section-desc">AushadhSanchaya is built exclusively for clinical environments with strict regulatory workflows.</p>
          </div>
        </FadeInSection>
        <div className="landing-why-cards">
          <FadeInSection delay={0.1}>
            <div className="landing-why-card">
              <div className="landing-why-card-icon">
                {/* Expiry SVG icon with continuous pulsing clock hands */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-pulse">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="12" cy="16" r="3" />
                  <polyline points="12,16 12,14 13.5,14" className="icon-clock-hand" />
                </svg>
              </div>
              <h3>FEFO Expiry Management</h3>
              <p>Automatically flags products nearing expiry and routes incoming inventory based on First-Expired, First-Out, preventing costly stock waste.</p>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div className="landing-why-card">
              <div className="landing-why-card-icon">
                {/* Batch tracing SVG icon with continuous signal pulsing */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-pulse">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                  <circle cx="12" cy="12" r="3" fill="var(--copper)" opacity="0.3" className="icon-dot-pulse" />
                </svg>
              </div>
              <h3>Batch-Level Traceability</h3>
              <p>Track every pharmaceutical item by its manufacturer batch and SKU. In the event of a recall, instantly isolate specific contaminated shipments.</p>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.3}>
            <div className="landing-why-card">
              <div className="landing-why-card-icon">
                {/* Secure RBAC SVG icon with shield pulse */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-pulse">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Role-Based Access</h3>
              <p>Enforce strict separation of duties. Five distinct roles (Admin, Inventory, Procurement, Distribution, Staff) secure ledger adjustments.</p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== INNOVATIVE FEATURES ===== */}
      <section className="landing-section landing-features" id="features">
        <FadeInSection>
          <div className="landing-section-header">
            <span className="landing-section-label">Innovative Architecture</span>
            <h2 className="landing-section-title">Clinical Tools Powered by Intelligence</h2>
            <p className="landing-section-desc">Designed to reduce manual entry overhead and eliminate audit errors.</p>
          </div>
        </FadeInSection>
        <div className="landing-features-grid">

          {/* Feature 1: MaomaoVision */}
          <FadeInSection>
            <div className="landing-feature-row">
              <div className="landing-feature-visual">
                {/* Continuous animated Scanning Camera SVG */}
                <svg width="320" height="240" viewBox="0 0 320 240" fill="none" className="camera-scan-svg">
                  {/* Camera outer body */}
                  <rect x="60" y="60" width="200" height="140" rx="16" stroke="var(--slate)" strokeWidth="2.5" opacity="0.35" fill="none" />
                  <circle cx="160" cy="130" r="45" stroke="var(--slate)" strokeWidth="2.5" opacity="0.3" fill="none" />
                  {/* Scanning Lens ring */}
                  <circle cx="160" cy="130" r="30" stroke="var(--teal)" strokeWidth="1.5" opacity="0.4" fill="none" className="lens-scan-ring" />
                  {/* Scanning Laser Line */}
                  <line x1="50" y1="130" x2="270" y2="130" stroke="var(--copper)" strokeWidth="1.5" className="scan-laser-line" />
                  {/* Sparkling AI Indicator */}
                  <g transform="translate(230, 80)" className="sparkle-group">
                    <line x1="8" y1="0" x2="8" y2="16" stroke="var(--teal)" strokeWidth="1.5" />
                    <line x1="0" y1="8" x2="16" y2="8" stroke="var(--teal)" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>
              <div className="landing-feature-content">
                <span className="landing-feature-badge">MaomaoVision AI</span>
                <h3>Camera-to-Catalog Inventory Sourcing</h3>
                <p>
                  Accelerate receipt checks. Align your smartphone or webcam with incoming pharmaceutical boxes. AushadhSanchaya's integrated vision intelligence parses barcodes, reads printed text fields, and auto-checks the contents.
                </p>
                <ul className="landing-feature-list">
                  <li>Instant optical label parsing and verification</li>
                  <li>Cross-references expiration dates automatically</li>
                  <li>Validates supplier batch codes in real time</li>
                </ul>
              </div>
            </div>
          </FadeInSection>

          {/* Feature 2: AI Dashboard Analysis */}
          <FadeInSection>
            <div className="landing-feature-row reverse">
              <div className="landing-feature-visual">
                {/* Continuous animated Graph/Dashboard SVG */}
                <svg width="320" height="240" viewBox="0 0 320 240" fill="none" className="dashboard-chart-svg">
                  {/* Outer window */}
                  <rect x="30" y="30" width="260" height="180" rx="12" stroke="var(--slate)" strokeWidth="2" opacity="0.3" fill="none" />
                  {/* Graph bars */}
                  <rect x="60" y="140" width="20" height="50" rx="3" fill="var(--sage)" fillOpacity="0.4" className="chart-bar-1" />
                  <rect x="95" y="110" width="20" height="80" rx="3" fill="var(--sage)" fillOpacity="0.4" className="chart-bar-2" />
                  <rect x="130" y="80" width="20" height="110" rx="3" fill="var(--teal)" fillOpacity="0.35" className="chart-bar-3" />
                  <rect x="165" y="130" width="20" height="60" rx="3" fill="var(--sage)" fillOpacity="0.4" className="chart-bar-4" />
                  <rect x="200" y="90" width="20" height="100" rx="3" fill="var(--teal)" fillOpacity="0.35" className="chart-bar-5" />
                  <rect x="235" y="120" width="20" height="70" rx="3" fill="var(--copper)" fillOpacity="0.5" className="chart-bar-6" />
                  {/* Traced Trend Line */}
                  <polyline points="70,135 105,105 140,75 175,125 210,85 245,115" stroke="var(--copper)" strokeWidth="2.5" opacity="0.75" fill="none" strokeLinecap="round" strokeLinejoin="round" className="chart-polyline" />
                </svg>
              </div>
              <div className="landing-feature-content">
                <span className="landing-feature-badge">Data Intelligence</span>
                <h3>AI-Driven Demand Sourcing</h3>
                <p>
                  Prevent critical stock-outs. AushadhSanchaya analyzes local prescription trends and historical inventory consumption to calculate seasonal demand curves and suggest optimal order levels.
                </p>
                <ul className="landing-feature-list">
                  <li>Surfaces low-stock alerts before a zero balance occurs</li>
                  <li>Generates local seasonal procurement forecasts</li>
                  <li>Spots batch consumption speed anomalies</li>
                </ul>
              </div>
            </div>
          </FadeInSection>

          {/* Feature 3: End-to-End Supply Chain */}
          <FadeInSection>
            <div className="landing-feature-row">
              <div className="landing-feature-visual">
                {/* Continuous animated Supply Chain Flow SVG */}
                <svg width="320" height="240" viewBox="0 0 320 240" fill="none" className="supply-chain-flow-svg">
                  <defs>
                    <marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6" fill="var(--slate)" opacity="0.4" />
                    </marker>
                  </defs>
                  {/* Nodes */}
                  <circle cx="60" cy="120" r="24" stroke="var(--slate)" strokeWidth="1.5" opacity="0.35" fill="none" />
                  <text x="60" y="124" textAnchor="middle" fill="var(--slate)" opacity="0.55" fontSize="8" fontWeight="600">Sourcing</text>
                  
                  <rect x="135" y="95" width="50" height="50" rx="8" stroke="var(--teal)" strokeWidth="2" opacity="0.4" fill="none" />
                  <text x="160" y="124" textAnchor="middle" fill="var(--teal)" opacity="0.7" fontSize="8" fontWeight="600">Ledger</text>
                  
                  <circle cx="260" cy="70" r="20" stroke="var(--slate)" strokeWidth="1.5" opacity="0.3" fill="none" />
                  <text x="260" y="73" textAnchor="middle" fill="var(--slate)" opacity="0.5" fontSize="7">Clinics</text>

                  <circle cx="260" cy="170" r="20" stroke="var(--slate)" strokeWidth="1.5" opacity="0.3" fill="none" />
                  <text x="260" y="173" textAnchor="middle" fill="var(--slate)" opacity="0.5" fontSize="7">Pharmacy</text>
                  
                  {/* Animated flow dots along lines */}
                  <line x1="84" y1="120" x2="135" y2="120" stroke="var(--slate)" strokeWidth="1.2" opacity="0.3" markerEnd="url(#flow-arrow)" />
                  <line x1="185" y1="110" x2="240" y2="80" stroke="var(--slate)" strokeWidth="1.2" opacity="0.25" />
                  <line x1="185" y1="130" x2="240" y2="160" stroke="var(--slate)" strokeWidth="1.2" opacity="0.25" />
                  
                  <circle cx="109" cy="120" r="3" fill="var(--copper)" className="flow-dot flow-dot-1" />
                  <circle cx="212" cy="95" r="3" fill="var(--teal)" className="flow-dot flow-dot-2" />
                </svg>
              </div>
              <div className="landing-feature-content">
                <span className="landing-feature-badge">Audit Ledger</span>
                <h3>Secure, End-to-End Supply Control</h3>
                <p>
                  Manage suppliers, create purchase orders, register inbound batches with quality check notes, generate PDF receipt printouts, and distribute securely to hospital wards or pharmacy counters in one audit loop.
                </p>
                <ul className="landing-feature-list">
                  <li>Inbound quality check validation logs</li>
                  <li>Multi-state purchase order approval routes</li>
                  <li>Automated digital receipt archiving</li>
                </ul>
              </div>
            </div>
          </FadeInSection>

        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="landing-section landing-reviews" id="reviews">
        <FadeInSection>
          <div className="landing-section-header">
            <span className="landing-section-label">Testimonials</span>
            <h2 className="landing-section-title">Trusted by Pharmacy Operations</h2>
            <p className="landing-section-desc">See how compliance managers and pharmacists audit their stock using AushadhSanchaya.</p>
          </div>
        </FadeInSection>
        <div className="landing-reviews-grid">
          <FadeInSection delay={0.1}>
            <div className="landing-review-card">
              <div className="landing-review-stars">★★★★★</div>
              <p className="landing-review-text">
                "Our previous system caused major headaches when matching invoice numbers and batch expiries. AushadhSanchaya's FEFO alert dashboard reduced expiration waste by 35% in our first quarter."
              </p>
              <div className="landing-review-author">
                <div className="landing-review-avatar">SM</div>
                <div>
                  <div className="landing-review-name">Sarah Mehta</div>
                  <div className="landing-review-role">Lead Pharmacist, Metro Health Center</div>
                </div>
              </div>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div className="landing-review-card">
              <div className="landing-review-stars">★★★★★</div>
              <p className="landing-review-text">
                "Separation of duties was a concern during audits. Setting strict roles for procurement staff versus inventory managers resolved all our compliance checks instantly."
              </p>
              <div className="landing-review-author">
                <div className="landing-review-avatar">DB</div>
                <div>
                  <div className="landing-review-name">Devendra Bansal</div>
                  <div className="landing-review-role">Compliance Director, Sterling Distributors</div>
                </div>
              </div>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.3}>
            <div className="landing-review-card">
              <div className="landing-review-stars">★★★★★</div>
              <p className="landing-review-text">
                "The MaomaoVision barcode and batch parsing works like a charm. Sourcing and receiving bulk products requires far fewer keystrokes, and double entries are down to zero."
              </p>
              <div className="landing-review-author">
                <div className="landing-review-avatar">AK</div>
                <div>
                  <div className="landing-review-name">Dr. Amit Kapoor</div>
                  <div className="landing-review-role">Director of Pharmacy, Lifeline Super Speciality</div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section className="landing-section landing-contact" id="contact">
        <FadeInSection>
          <div className="landing-section-header">
            <span className="landing-section-label">Contact</span>
            <h2 className="landing-section-title">Optimize Your Supply Chain Sourcing</h2>
            <p className="landing-section-desc">Reach out to schedule a clinical ledger demo or request custom integration documentation.</p>
          </div>
        </FadeInSection>
        <div className="landing-contact-grid">
          <FadeInSection delay={0.1}>
            <form className="landing-contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="landing-contact-form-row">
                <input className="landing-contact-input" type="text" placeholder="Your Name" />
                <input className="landing-contact-input" type="email" placeholder="Your Email" />
              </div>
              <input className="landing-contact-input" type="text" placeholder="Subject" />
              <textarea className="landing-contact-textarea" rows="5" placeholder="Request details..."></textarea>
              <button className="landing-contact-submit" type="submit">Submit Request</button>
            </form>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div className="landing-contact-info">
              <div className="landing-contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <strong>Address</strong>
                  <p>AushadhSanchaya HQ, Sector 62, Noida, UP, India</p>
                </div>
              </div>
              <div className="landing-contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <strong>Email</strong>
                  <p>support@aushadhsanchaya.com</p>
                </div>
              </div>
              <div className="landing-contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <strong>Business Hours</strong>
                  <p>Mon - Sat: 9:00 AM — 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <h3>AushadhSanchaya</h3>
            <p>Clinical-grade pharmaceutical inventory ledgers and batch traceability management.</p>
          </div>
          <div className="landing-footer-links">
            <div>
              <h4>Architecture</h4>
              <a href="#features">Features</a>
              <a href="#why">Why Us</a>
              <a href="#reviews">Testimonials</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <div>
              <h4>Regulatory</h4>
              <a href="#">Privacy Protocol</a>
              <a href="#">Terms of Ledger</a>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
           <p>© 2026 AushadhSanchaya. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== AUTH MODAL ===== */}
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} initialMode={authModalMode} />

    </div>
  );
};

export default LandingPage;
