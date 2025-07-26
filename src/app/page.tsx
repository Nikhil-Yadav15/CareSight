"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function App() {
  const mountRef = useRef(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof __initial_auth_token !== 'undefined') {
      setIsAuthReady(true);
      setUserId('authenticated-user');
    } else {
      setIsAuthReady(true);
      setUserId('anonymous-user');
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Enhanced starfield with multiple colors
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const starVertices = [];
    const starColors = [];
    const starCount = 1500;
    
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;
      starVertices.push(x, y, z);

      // Create varied star colors (blues, purples, whites)
      const colorType = Math.random();
      if (colorType < 0.6) {
        starColors.push(1, 1, 1); // White
      } else if (colorType < 0.8) {
        starColors.push(0.4, 0.7, 1); // Blue
      } else {
        starColors.push(0.8, 0.4, 1); // Purple
      }
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Add floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particleVertices = [];
    const particleCount = 300;
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      particleVertices.push(x, y, z);
    }
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate stars
      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0002;

      // Animate particles
      particles.rotation.x += 0.0005;
      particles.rotation.y -= 0.0003;

      // Enhanced twinkling effect
      const colors = starGeometry.attributes.color.array;
      for (let i = 0; i < starCount; i++) {
        if (Math.random() > 0.998) {
          const intensity = 0.3 + Math.random() * 0.7;
          colors[i * 3] *= intensity;
          colors[i * 3 + 1] *= intensity;
          colors[i * 3 + 2] *= intensity;
        } else {
          colors[i * 3] += (starColors[i * 3] - colors[i * 3]) * 0.02;
          colors[i * 3 + 1] += (starColors[i * 3 + 1] - colors[i * 3 + 1]) * 0.02;
          colors[i * 3 + 2] += (starColors[i * 3 + 2] - colors[i * 3 + 2]) * 0.02;
        }
      }
      starGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      scene.clear();
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="fixed inset-0 z-0"></div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-indigo-900/20 z-0"></div>

      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-white/5 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Care Sight
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#welcome" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:scale-105 transform">Home</a>
              <a href="#services" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:scale-105 transform">Services</a>
              <a href="#about" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:scale-105 transform">About</a>
              <a href="#contact" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:scale-105 transform">Contact</a>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleSignIn}
                className="px-6 py-2 text-white/90 hover:text-white border border-white/30 rounded-full hover:border-white/50 transition-all duration-200 hover:scale-105 transform"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUp}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 transform shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="welcome" className="relative z-10 flex-grow flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Care Sight
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Advanced healthcare insights powered by AI. Transforming patient care through intelligent monitoring and predictive analytics.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleExploreClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 transform shadow-xl"
            >
              Explore Solutions
            </button>
            <button className="px-8 py-4 text-white border border-white/30 rounded-full text-lg font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-200 hover:scale-105 transform">
              Watch Demo
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 transform">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">🩺</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Monitoring</h3>
              <p className="text-white/70">Real-time patient vitals tracking with AI-powered anomaly detection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 transform">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Predictive Analytics</h3>
              <p className="text-white/70">Advanced algorithms to predict health outcomes and prevent complications</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 transform">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
              <p className="text-white/70">Intelligent care recommendations and automated documentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-20 px-6 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Healthcare Solutions
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Comprehensive care technology designed for modern healthcare providers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 transform">
              <h3 className="text-2xl font-bold text-white mb-4">Critical Care Monitoring</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Continuous monitoring of vital signs with instant alerts for healthcare professionals. Our AI-powered system detects patterns and anomalies that might indicate deteriorating patient conditions.
              </p>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200">
                Learn More
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 transform">
              <h3 className="text-2xl font-bold text-white mb-4">Preventive Care Analytics</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Leverage machine learning to identify risk factors and predict potential health issues before they become critical. Enabling proactive rather than reactive healthcare.
              </p>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 px-6 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            About Care Sight
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            Care Sight represents the next generation of healthcare technology, combining artificial intelligence with compassionate care. We're dedicated to improving patient outcomes through intelligent monitoring, predictive analytics, and seamless integration with existing healthcare systems.
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            Founded by healthcare professionals and technology experts, our mission is to bridge the gap between cutting-edge AI and practical healthcare applications. We believe that technology should enhance, not replace, the human touch in healthcare.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-20 px-6 mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-white/70">
              Ready to transform your healthcare practice? Let's discuss how Care Sight can help.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                    placeholder="you@healthcare.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Organization</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  placeholder="Healthcare Institution"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors duration-200 resize-none"
                  placeholder="Tell us about your healthcare technology needs..."
                ></textarea>
              </div>
              <button
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 transform shadow-xl"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 mt-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Care Sight
              </span>
            </div>
            <p className="text-white/60 mb-6">
              &copy; {new Date().getFullYear()} Care Sight. All rights reserved. Transforming healthcare through intelligent technology.
            </p>
            <div className="flex justify-center space-x-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}