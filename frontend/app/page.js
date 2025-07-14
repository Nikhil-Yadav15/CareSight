'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { 
  Heart, 
  Shield, 
  Users, 
  Activity, 
  MessageSquare, 
  Stethoscope,
  ArrowRight,
  Check,
  Moon,
  Sun
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Save theme preference and apply to document
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Voice Communication",
      description: "Advanced voice recognition for patients with communication difficulties"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Continuous emotion detection and alert system for immediate care"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Care Coordination",
      description: "Seamless connection between patients, nurses, and administrators"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "HIPAA-compliant security with role-based access control"
    }
  ];

  const benefits = [
    "Improve patient-caregiver communication",
    "Reduce response time to patient needs",
    "Streamline healthcare workflows",
    "Enhance patient satisfaction and safety"
  ];

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
        <BackgroundBeams className="absolute inset-0 z-0" />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse transition-colors duration-700 ${
          isDarkMode ? 'bg-blue-400' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 transition-colors duration-700 ${
          isDarkMode ? 'bg-green-400' : 'bg-green-200'
        }`}></div>
        <div className={`absolute bottom-20 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000 transition-colors duration-700 ${
          isDarkMode ? 'bg-indigo-400' : 'bg-indigo-200'
        }`}></div>
      </div>

      {/* Floating particles for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-float-delayed opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-float-slow opacity-50"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-30"></div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                VoiceOut
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="icon"
                className={`relative w-10 h-10 rounded-full transition-all duration-500 cursor-pointer ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
                    : 'border-blue-200 bg-white hover:bg-blue-50'
                }`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Sun className={`w-5 h-5 transition-all duration-500 ${
                    isDarkMode 
                      ? 'text-gray-400 scale-0 rotate-90' 
                      : 'text-yellow-500 scale-100 rotate-0'
                  }`} />
                  <Moon className={`w-5 h-5 absolute transition-all duration-500 ${
                    isDarkMode 
                      ? 'text-blue-400 scale-100 rotate-0' 
                      : 'text-gray-400 scale-0 -rotate-90'
                  }`} />
                </div>
              </Button>
              
              <Button 
                onClick={handleLoginClick}
                variant="outline"
                className={` transition-all text-lg duration-300 cursor-pointer ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 border-gray-600 text-white' 
                    : 'hover:bg-blue-50 border-blue-200'
                }`}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className={`mb-4 border-8 text-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}>
            Healthcare Communication Platform
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-green-600 bg-clip-text text-transparent leading-tight">
            Empowering Healthcare
            <br />
            <span className="text-4xl md:text-5xl">Communication</span>
          </h2>
          
          <p className={`text-xl mb-8 max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            VoiceOut bridges communication gaps in healthcare, enabling patients with communication 
            difficulties to connect seamlessly with their care team through innovative voice 
            recognition and real-time monitoring technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                isDarkMode ? 'shadow-blue-900/50' : ''
              }`}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className={`flex items-center space-x-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm">Trusted by healthcare professionals</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-gray-800/80 hover:bg-gray-700/80' 
                : 'bg-white/80 hover:bg-white/90'
            }`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className={`backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/60 border border-gray-700' 
            : 'bg-white/60 border border-blue-100'
        }`}>
          <div className="text-center mb-8">
            <h3 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Why Choose VoiceOut?
            </h3>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Designed specifically for healthcare environments with patient safety and communication at its core
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center shadow-2xl">
                  <Heart className="w-24 h-24 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Ready to Transform Healthcare Communication?
          </h3>
          <p className={`text-lg mb-8 max-w-2xl mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join healthcare professionals who are already using VoiceOut to improve patient care and communication efficiency.
          </p>
          
          <Button 
            onClick={handleLoginClick}
            size="lg"
            className={`bg-gradient-to-r cursor-pointer from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 ${
              isDarkMode ? 'shadow-green-900/50' : ''
            }`}
          >
            Access Your Dashboard
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-8 border-t backdrop-blur-sm transition-all duration-300 ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800/40' 
          : 'border-blue-100 bg-white/40'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              VoiceOut
            </span>
          </div>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Empowering healthcare communication • Built with care for patients and providers
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(270deg); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 1s;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  );
}
