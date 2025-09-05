'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'hospital':
        return '/dashboard/hospital';
      case 'nurse':
        return '/dashboard/nurse';
      case 'patients':
        return '/dashboard/patient';
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const roles = ['hospital', 'nurse', 'patients'];

    try {
      for (const role of roles) {
        const { data, error } = await supabase
          .from(role)
          .select('*')
          .eq('email', form.email)
          .eq('password', form.password)
          .maybeSingle();

        if (data && !error) {
          localStorage.setItem('user_id', data.id);
          localStorage.setItem('role', role);
          localStorage.setItem('user_name', data.name);

          alert('✅ Login Successful!');

          const dashboardRoute = getDashboardRoute(role);
          router.push(dashboardRoute);
          return;
        }
      }

      alert('❌ Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-100 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Main form container with glass effect */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 bg-white/80 backdrop-filter backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          {/* Logo & Title */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              Care Sight
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to your secure portal</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          {/* Email Field */}
          <div className="group/input">
            <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover/input:text-blue-600 transition-colors" size={20} />
            </div>
          </div>

          {/* Password Field */}
          <div className="group/input">
            <label className="block text-gray-700 font-medium mb-2 group-hover/input:text-blue-600 transition-colors duration-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pl-12 pr-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover/input:text-blue-600 transition-colors" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] transform active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Redirect to Sign Up */}
        <div className="mt-6 text-center text-gray-600">
          <p>Don't have an account?{' '}
            <button
              type="button"
              onClick={handleSignUpRedirect}
              className="font-semibold text-blue-600 hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}