'use client';

import { useState } from 'react';
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

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Function to get dashboard route based on role
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'hospital':
        return '/dashboard/hospital';
      case 'nurse':
        return '/dashboard/nurse';
      case 'patients': // Changed from 'patients' for consistency with PatientDashboard
        return '/dashboard/patient';
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async () => {
    // Basic validation
    if (!form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Use 'patient' instead of 'patients' for consistency
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
          // Store user data in localStorage
          localStorage.setItem('user_id', data.id);
          localStorage.setItem('role', role);
          localStorage.setItem('user_name', data.name);

          alert('✅ Login Successful!');

          // Redirect to role-specific dashboard
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    // Outer container for the full screen, with dark background and subtle gradient/noise
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-950 text-gray-200 overflow-hidden">
      {/* Subtle background texture/glow elements - Similar to RegisterPage */}
      <div className="absolute inset-0 z-0 opacity-20">
        {/* Silver glow effect 1 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-700 to-gray-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        {/* Silver glow effect 2 */}
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-gray-700 to-gray-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        {/* Silver glow effect 3 */}
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-tr from-gray-700 to-gray-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Tailwind CSS keyframes for background animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Main form container with glass effect on dark background - Similar to RegisterPage */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 bg-black bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700 border-opacity-50">
        <div className="text-center mb-8">
          {/* Login Icon Circle - Styled for dark theme */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-full mb-4 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-50 mb-2 drop-shadow-sm">Welcome Back</h1>
          <p className="text-gray-400 text-lg">Sign in to your secure healthcare portal</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          {/* Email Field - Styled for dark theme */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-600"
              required
            />
          </div>

          {/* Password Field - Styled for dark theme */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-400" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pr-12 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button - Styled for dark theme */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 transform ${
              isLoading
                ? 'bg-gray-700 cursor-not-allowed' // Darker gray for loading state
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div> {/* Larger spinner */}
                Signing In...
              </div>
            ) : (
              <>
                <LogIn className="inline w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Additional Options - Styled for dark theme */}
        <div className="mt-8 text-center">
          <p className="text-md text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-500 hover:text-blue-400 font-bold hover:underline ml-1 transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Removed Role Information section as per request */}
      </div>
    </div>
  );
}
