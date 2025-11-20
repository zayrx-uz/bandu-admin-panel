/**
 * Dark Mode Design System - React Component Examples
 * Copy these components into your React application
 */

import React, { useState } from 'react';

// ============================================
// 1. RESPONSIVE NAVBAR
// ============================================
export const ResponsiveNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="text-text font-semibold text-lg hover:text-primary transition">
          Brand
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          <a className="text-subtext hover:text-text transition-colors" href="#">Home</a>
          <a className="text-subtext hover:text-text transition-colors" href="#">Products</a>
          <a className="text-subtext hover:text-text transition-colors" href="#">Docs</a>
          
          {/* Primary CTA Button */}
          <button className="ml-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium transition-all shadow-dark-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-surface">
            Get started
          </button>
        </nav>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-lg text-subtext hover:text-text hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-600 transition" 
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-4 space-y-3">
            <a className="block text-subtext hover:text-text transition-colors" href="#">Home</a>
            <a className="block text-subtext hover:text-text transition-colors" href="#">Products</a>
            <a className="block text-subtext hover:text-text transition-colors" href="#">Docs</a>
            <button className="w-full mt-4 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium transition">
              Get started
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

// ============================================
// 2. HERO SECTION
// ============================================
export const HeroSection = () => {
  return (
    <section className="bg-bg text-text py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-text to-subtext bg-clip-text text-transparent">
          Beautiful UI, optimized for dark mode
        </h1>
        
        {/* Subheadline */}
        <p className="text-subtext text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Ready-made Tailwind components with great contrast and smooth animations.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* Primary Button */}
          <a 
            className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-600 transition-all shadow-dark-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-bg"
            href="#">
            Get Started
          </a>
          
          {/* Ghost Button */}
          <a 
            className="px-6 py-3 rounded-lg border border-border text-subtext hover:text-text hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-bg"
            href="#">
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
};

// ============================================
// 3. CARD COMPONENT
// ============================================
export const CardComponent = ({ image, title, description, meta, onAction }) => {
  return (
    <article className="max-w-sm bg-surface text-text rounded-2xl p-6 border border-border shadow-dark-md hover:shadow-dark-md hover:border-primary/30 transition-all">
      {/* Image */}
      {image && (
        <img 
          src={image} 
          alt={title} 
          className="rounded-xl mb-4 w-full h-44 object-cover"
        />
      )}
      
      {/* Title */}
      <h3 className="text-lg font-semibold mb-1 text-text">{title}</h3>
      
      {/* Meta/Description */}
      <p className="text-subtext mb-4 text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Footer Actions */}
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">{meta}</span>
        <button 
          onClick={onAction}
          className="px-3 py-1 rounded-md bg-primary text-white text-sm hover:bg-primary-600 transition focus:outline-none focus:ring-2 focus:ring-primary-600">
          Open
        </button>
      </div>
    </article>
  );
};

// ============================================
// 4. BUTTONS (Primary & Ghost)
// ============================================
export const PrimaryButton = ({ children, onClick, disabled, ...props }) => {
  return (
    <button 
      className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-dark-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
};

export const GhostButton = ({ children, onClick, disabled, ...props }) => {
  return (
    <button 
      className="px-6 py-3 rounded-lg border border-border text-subtext hover:text-text hover:border-primary/50 hover:bg-surface/50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
};

// ============================================
// 5. ACCESSIBLE FORM INPUT
// ============================================
export const FormInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false,
  ...props 
}) => {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <label className="block mb-4">
      {/* Label */}
      <span className="text-text text-sm font-medium mb-2 inline-block">
        {label}
        {required && <span className="text-muted ml-1">(required)</span>}
      </span>
      
      {/* Input */}
      <input 
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg bg-bg/60 border ${
          error ? 'border-yellow-400' : 'border-border'
        } text-text placeholder:text-muted placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      
      {/* Error State */}
      {error && (
        <p className="mt-2 text-sm text-yellow-400" id={errorId} role="alert">
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-xs text-subtext">
          {helperText}
        </p>
      )}
    </label>
  );
};

// ============================================
// USAGE EXAMPLE
// ============================================
export const DesignSystemExample = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
    } else {
      setError('');
      // Submit logic
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <ResponsiveNavbar />
      <HeroSection />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <CardComponent 
            image="https://via.placeholder.com/400x200/7c3aed/ffffff?text=Card+1"
            title="Card Title 1"
            description="Short description that remains readable in dark mode."
            meta="2 min read"
            onAction={() => console.log('Card 1 clicked')}
          />
          <CardComponent 
            image="https://via.placeholder.com/400x200/7c3aed/ffffff?text=Card+2"
            title="Card Title 2"
            description="Another card with proper dark mode contrast."
            meta="5 min read"
            onAction={() => console.log('Card 2 clicked')}
          />
          <CardComponent 
            image="https://via.placeholder.com/400x200/7c3aed/ffffff?text=Card+3"
            title="Card Title 3"
            description="Third card demonstrating the design system."
            meta="3 min read"
            onAction={() => console.log('Card 3 clicked')}
          />
        </div>

        <div className="max-w-md mx-auto bg-surface rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-text mb-6">Contact Form</h2>
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={error}
              helperText="We'll never share your email with anyone else."
              required
            />
            <div className="flex gap-4 mt-6">
              <PrimaryButton type="submit">Submit</PrimaryButton>
              <GhostButton type="button" onClick={() => setFormData({ email: '' })}>
                Reset
              </GhostButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

