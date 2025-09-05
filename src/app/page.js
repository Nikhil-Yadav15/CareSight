'use client';

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
        if (entry.isIntersecting) setAboutInView(true);
      },
      { threshold: 0.3 }
    );
    if (aboutRef.current) observer.observe(aboutRef.current);
    return () => {
      if (aboutRef.current) observer.unobserve(aboutRef.current);
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

  // Calculates transform styles based on scroll for animated cards
  const getCardTransform = (index, sectionOffset = 800) => {
    const cardOffset = sectionOffset + index * 400;
    const scrollEntryStart = cardOffset - 300,
          scrollEntryEnd = cardOffset - 100;
    const scrollExitStart = cardOffset + 600;
    const scrollExitEnd = scrollExitStart + 200;

    const entryProgress = Math.max(0, Math.min(1, (scrollY - scrollEntryStart) / (scrollEntryEnd - scrollEntryStart)));
    const exitProgress = Math.max(0, Math.min(1, (scrollY - scrollExitStart) / (scrollExitEnd - scrollExitStart)));

    const isVisible = scrollY >= scrollEntryStart && scrollY < scrollExitEnd;

    if (!isVisible) return {
      transform: 'translateY(100px) scale(0.9)',
      opacity: 0,
      zIndex: 10 + index,
      pointerEvents: 'none'
    };
    if (entryProgress < 1) return {
      transform: `translateY(${(1 - entryProgress) * 100}px) scale(${0.9 + entryProgress * 0.1})`,
      opacity: entryProgress,
      zIndex: 10 + index,
      pointerEvents: 'auto'
    };
    if (exitProgress > 0) return {
      transform: `translateY(${-(exitProgress * 100)}px) scale(${1 - exitProgress * 0.1})`,
      opacity: 1 - exitProgress,
      zIndex: 10 + index,
      pointerEvents: exitProgress > 0.5 ? 'none' : 'auto'
    };
    return {
      transform: 'translateY(0px) scale(1)',
      opacity: 1,
      zIndex: 10 + index,
      pointerEvents: 'auto'
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Care Sight</span>
          </div>
          <div className="hidden md:flex space-x-8">
            {['#welcome', '#services', '#about', '#contact'].map((href, idx) => (
              <a key={idx} href={href} className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                {href.replace('#', '').charAt(0).toUpperCase() + href.slice(2)}
              </a>
            ))}
          </div>
          <div className="flex space-x-4">
            <button onClick={handleSignIn} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:text-blue-600 hover:border-blue-600 transition-all duration-200">
              Sign In
            </button>
            <button onClick={handleSignUp} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="welcome" className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-100 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="relative max-w-6xl text-center z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/50 animate-[fadeInUp_1s_ease-out]">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 animate-[fadeInUp_1s_ease-out_0.2s_both]">
              Care Sight
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out_0.4s_both]">
              Advanced healthcare insights powered by AI. Transforming patient care through intelligent monitoring and predictive analytics.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10 animate-[fadeInUp_1s_ease-out_0.6s_both]">
              {['AI‑Powered', 'Real‑Time', 'Secure'].map((title, i) => (
                <div
                  key={i}
                  className={`bg-${i === 0 ? 'blue' : i === 1 ? 'green' : 'purple'}-50 rounded-xl p-6 border border-${i === 0 ? 'blue' : i === 1 ? 'green' : 'purple'}-100`}
                >
                  <div className={`w-12 h-12 bg-${i === 0 ? 'blue' : i === 1 ? 'green' : 'purple'}-600 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                    <span className="text-white text-xl">{i === 0 ? '🤖' : i === 1 ? '⚡' : '🛡'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">
                    {i === 0
                      ? 'Advanced machine learning algorithms'
                      : i === 1
                      ? 'Instant monitoring and alerts'
                      : 'HIPAA compliant infrastructure'}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeInUp_1s_ease-out_0.8s_both]">
              <button onClick={handleExploreClick} className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform">
                Explore Solutions
              </button>
              <button className="px-8 py-4 text-blue-600 border border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-105 transform">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stacked Card Sections */}
      <section className="relative">
        <div className="h-screen"></div>
        {['Emotion Detector', 'Gaze-Controlled Interface', 'Role-Based Dashboards', 'Predictive Analytics'].map((title, id) => (
          <div key={id} className="fixed top-0 left-0 w-full h-screen flex items-center justify-center px-6" style={getCardTransform(id)}>
            <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-2xl border border-gray-200">
              <div className="text-center">
                <div className={`w-20 h-20 bg-${id === 0 ? 'blue' : id === 1 ? 'purple' : id === 2 ? 'green' : 'orange'}-100 rounded-full flex items-center justify-center mb-8 mx-auto`}>
                  <span className={`text-${id === 0 ? 'blue' : id === 1 ? 'purple' : id === 2 ? 'green' : 'orange'}-600 text-4xl`}>{['😟', '👁️', '📈', '🧠'][id]}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{title}</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {[
                    'Our advanced AI system continuously monitors patient emotions in real-time.',
                    'Hands-free interaction through eye gaze detection.',
                    'Dashboards customized per user role.',
                    'Predictive analytics to anticipate health risks.'
                  ][id]}
                </p>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {[
                        'Real-time Monitoring',
                        'Accessibility First',
                        'Multi-Role Support',
                        'Early Warning System'
                      ][id]}
                    </h3>
                    <p className="text-gray-600">
                      {[
                        'Detect emotional distress instantly.',
                        'Control interface entirely via gaze.',
                        'Role-specific dashboards.',
                        'Predict patient complications in advance.'
                      ][id]}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {[
                        'Instant Alerts',
                        'Precision Tracking',
                        'Real-time Data',
                        'Risk Assessment'
                      ][id]}
                    </h3>
                    <p className="text-gray-600">
                      {[
                        'Alerts nursing staff immediately.',
                        'High accuracy gaze detection.',
                        'Live data updates.',
                        'Insightful trend analysis.'
                      ][id]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="h-[320vh]"></div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="relative py-20 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className={`text-center transition-all duration-1000 ${aboutInView ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">About Care Sight</h2>
          </div>
          <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-1000 delay-200 ${aboutInView ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <p className="text-xl text-gray-600 leading-relaxed">
              Care Sight represents next-gen healthcare combining AI with compassionate care—improving patient outcomes through intelligent monitoring, predictive analytics, and seamless integration.
            </p>
          </div>
          <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-1000 delay-400 ${aboutInView ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded by healthcare professionals and tech experts, we're bridging AI and human healthcare—enhancing outcomes with the human touch.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {['Mission', 'Vision'].map((title, idx) => (
              <div key={idx} className={`rounded-2xl p-8 border transition-all duration-1000 delay-${600 + idx * 200} ${aboutInView ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${idx === 0 ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${idx === 0 ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  <span className="text-white text-2xl">{idx === 0 ? '🎯' : '🚀'}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our {title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {idx === 0
                    ? 'To revolutionize healthcare with intelligent tech that empowers professionals and enhances patient care with precision, compassion and innovation.'
                    : 'A future where AI integrates seamlessly with healthcare—enabling early intervention, personalized care and better outcomes worldwide.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Ready to transform your healthcare practice? Let's discuss how Care Sight can help.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="space-y-6">
              {['Name', 'Email'].map((label, idx) => (
                <div key={idx} className="group/input">
                  <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">{label}</label>
                  <input
                    type={label === 'Email' ? 'email' : 'text'}
                    placeholder={label === 'Name' ? 'Your Name' : 'you@healthcare.com'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                  />
                </div>
              ))}
              <div className="group/input">
                <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Organization</label>
                <input
                  type="text"
                  placeholder="Healthcare Institution"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                />
              </div>
              <div className="group/input">
                <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Message</label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your healthcare technology needs..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none hover:border-blue-400 hover:shadow-md"
                ></textarea>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform active:scale-95">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Care Sight</span>
          </div>
          <p className="text-gray-600 mb-6">
            &copy; {new Date().getFullYear()} Care Sight. All rights reserved.
          </p>
          <div className="flex justify-center space-x-8">
            {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map((text, idx) => (
              <a key={idx} href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                {text}
              </a>
            ))}
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
