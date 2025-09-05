"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [aboutInView, setAboutInView] = useState(false);
  const aboutRef = useRef(null);

  // Handle scroll effect for navbar and card stacking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for About section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current);
      }
    };
  }, []);

  const handleSignIn = () => {
    window.location.href = '/auth/login';
  };

  const handleSignUp = () => {
    window.location.href = '/auth/register';
  };

  const handleExploreClick = () => {
    window.location.href = '/auth/register';
  };

  // Calculate card positions based on scroll with proper exit animation
  const getCardTransform = (index, sectionOffset = 800) => {
    const cardOffset = sectionOffset + (index * 400);
    const cardDuration = 600; // Duration each card is visible
    const exitDuration = 200; // Duration for exit animation
    
    // Entry animation
    const entryProgress = Math.max(0, Math.min(1, (scrollY - cardOffset + 300) / 200));
    
    // Exit animation - starts when the next card is almost fully visible
    const exitStart = cardOffset + cardDuration;
    const exitProgress = Math.max(0, Math.min(1, (scrollY - exitStart) / exitDuration));
    
    // Combined visibility
    const isVisible = scrollY >= cardOffset - 300 && scrollY < exitStart + exitDuration;
    
    if (!isVisible) {
      return {
        transform: 'translateY(100px) scale(0.9)',
        opacity: 0,
        zIndex: 10 + index,
        pointerEvents: 'none'
      };
    }

    // Entry animation
    if (entryProgress < 1) {
      const translateY = (1 - entryProgress) * 100;
      const scale = 0.9 + (entryProgress * 0.1);
      const opacity = entryProgress;
      
      return {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        zIndex: 10 + index,
        pointerEvents: 'auto'
      };
    }

    // Exit animation
    if (exitProgress > 0) {
      const translateY = -(exitProgress * 100);
      const scale = 1 - (exitProgress * 0.1);
      const opacity = 1 - exitProgress;
      
      return {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        zIndex: 10 + index,
        pointerEvents: exitProgress > 0.5 ? 'none' : 'auto'
      };
    }

    // Fully visible state
    return {
      transform: 'translateY(0px) scale(1)',
      opacity: 1,
      zIndex: 10 + index,
      pointerEvents: 'auto'
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Care Sight
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#welcome" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Home</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Contact</a>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleSignIn}
                className="px-6 py-2 text-gray-700 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-600 transition-all duration-200"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUp}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="welcome" className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-100 rounded-full opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-6xl text-center z-10">
          {/* Main Content Box */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/50 animate-[fadeInUp_1s_ease-out]">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 animate-[fadeInUp_1s_ease-out_0.2s_both]">
              Care Sight
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out_0.4s_both]">
              Advanced healthcare insights powered by AI. Transforming patient care through intelligent monitoring and predictive analytics.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-10 animate-[fadeInUp_1s_ease-out_0.6s_both]">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-xl">🧠</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600">Advanced machine learning algorithms</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-Time</h3>
                <p className="text-sm text-gray-600">Instant monitoring and alerts</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-sm text-gray-600">HIPAA compliant infrastructure</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeInUp_1s_ease-out_0.8s_both]">
              <button 
                onClick={handleExploreClick}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Explore Solutions
              </button>
              <button className="px-8 py-4 text-blue-600 border border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-105 transform">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stacked Cards Section */}
      <section className="relative">
        <div className="h-screen"></div> {/* Spacer for scroll */}
        
        {/* Card 1 - Emotion Detector */}
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6"
          style={getCardTransform(0, 800)}
        >
          <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <span className="text-blue-600 text-4xl">😟</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Emotion Detector
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our advanced AI system continuously monitors patient facial expressions and body language to detect emotional distress, anxiety, or discomfort in real-time.
              </p>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-time Monitoring</h3>
                  <p className="text-gray-600">Continuous analysis of patient emotional states using computer vision and machine learning algorithms.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Instant Alerts</h3>
                  <p className="text-gray-600">Immediate notifications to nursing staff when emotional distress is detected, enabling rapid response.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Gaze Control */}
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6"
          style={getCardTransform(1, 800)}
        >
          <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <span className="text-purple-600 text-4xl">👁️</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Gaze-Controlled Interface
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Revolutionary hands-free interaction technology that allows patients to control devices and communicate simply by looking at interface elements.
              </p>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility First</h3>
                  <p className="text-gray-600">Perfect for patients with limited mobility, enabling full system interaction through eye movement alone.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Precision Tracking</h3>
                  <p className="text-gray-600">High-accuracy eye tracking technology with sub-degree precision for reliable interface control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Dashboards */}
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6"
          style={getCardTransform(2, 800)}
        >
          <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <span className="text-green-600 text-4xl">📈</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Role-Based Dashboards
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Customized interfaces for different healthcare roles, providing relevant information and controls tailored to specific responsibilities and workflows.
              </p>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Multi-Role Support</h3>
                  <p className="text-gray-600">Separate optimized interfaces for administrators, nurses, doctors, and patients with role-specific features.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-time Data</h3>
                  <p className="text-gray-600">Live updates and synchronized information across all dashboards for coordinated patient care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 - Analytics */}
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6"
          style={getCardTransform(3, 800)}
        >
          <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <span className="text-orange-600 text-4xl">🧠</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Predictive Analytics
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Advanced machine learning algorithms analyze patient data patterns to predict potential health complications before they become critical.
              </p>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Early Warning System</h3>
                  <p className="text-gray-600">Proactive identification of deteriorating patient conditions with up to 24-hour advance notice.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                  <p className="text-gray-600">Comprehensive risk scoring and trend analysis for better clinical decision-making.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[320vh]"></div> {/* Reduced spacer for proper card exit */}
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="relative py-20 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-8 transition-all duration-1000 ${
              aboutInView 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`}>
              About Care Sight
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-1000 delay-200 ${
              aboutInView 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`}>
              <p className="text-xl text-gray-600 leading-relaxed">
                Care Sight represents the next generation of healthcare technology, combining artificial intelligence with compassionate care. We're dedicated to improving patient outcomes through intelligent monitoring, predictive analytics, and seamless integration with existing healthcare systems.
              </p>
            </div>
            
            <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-1000 delay-400 ${
              aboutInView 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`}>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded by healthcare professionals and technology experts, our mission is to bridge the gap between cutting-edge AI and practical healthcare applications. We believe that technology should enhance, not replace, the human touch in healthcare.
              </p>
            </div>
            
            {/* Mission & Vision Cards */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className={`bg-blue-50 rounded-2xl p-8 border border-blue-100 transition-all duration-1000 delay-600 ${
                aboutInView 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-full opacity-0'
              }`}>
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize healthcare through intelligent technology that empowers medical professionals and enhances patient care with precision, compassion, and innovation.
                </p>
              </div>
              
              <div className={`bg-purple-50 rounded-2xl p-8 border border-purple-100 transition-all duration-1000 delay-800 ${
                aboutInView 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-full opacity-0'
              }`}>
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  A future where AI seamlessly integrates with healthcare workflows, enabling early intervention, personalized care, and improved outcomes for patients worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to transform your healthcare practice? Let's discuss how Care Sight can help.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group/input">
                  <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                    placeholder="Your Name"
                  />
                </div>
                <div className="group/input">
                  <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                    placeholder="you@healthcare.com"
                  />
                </div>
              </div>
              <div className="group/input">
                <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Organization</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                  placeholder="Healthcare Institution"
                />
              </div>
              <div className="group/input">
                <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none hover:border-blue-400 hover:shadow-md"
                  placeholder="Tell us about your healthcare technology needs..."
                ></textarea>
              </div>
              <button
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform active:scale-95"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Care Sight
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              &copy; {new Date().getFullYear()} Care Sight. All rights reserved. Transforming healthcare through intelligent technology.
            </p>
            <div className="flex justify-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}