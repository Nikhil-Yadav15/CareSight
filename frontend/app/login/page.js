"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { SparklesCore } from '@/components/ui/sparkles';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Heart,
  Shield,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function Login() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Animation mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    console.log('Login page - user:', user);
    if (user) {
      const redirectPath = user.role === 'patient' ? '/patient' : 
                          user.role === 'nurse' ? '/nurse' : '/admin';
      console.log('User logged in, redirecting to:', redirectPath);
      
      toast.success("Welcome back!", {
        description: `Redirecting to your ${user.role} dashboard...`,
        duration: 2000,
      });
      
      router.push(redirectPath);
    }
  }, [user, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting sign in with:', formData.email);
      const result = await signIn(formData.email, formData.password);
      console.log('Sign in result:', result);
      
      toast.success("Login successful!", {
        description: "Welcome to VoiceOut",
        duration: 3000,
      });
      
      // Force a page reload to trigger auth state change
      window.location.reload();
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Aceternity Background Effects */}
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      {/* Sparkles Effect */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#3b82f6"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/40 to-green-900/20 z-10"></div>

      {/* Additional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link href="/">
          <Button variant="ghost" className="text-white/80 hover:text-white cursor-pointer hover:bg-white/10 backdrop-blur-sm">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className={`text-center transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 backdrop-blur-sm border border-white/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-white to-green-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-white/70 text-lg">
              Sign in to your VoiceOut account
            </p>
          </div>

          {/* Main Login Card */}
          <Card className={`shadow-2xl border-0 bg-black/40 backdrop-blur-md border border-white/10 transform transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-white/60">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute cursor-pointer right-3 top-3 h-4 w-4 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-400/50 bg-red-500/10 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black/40 px-4 text-white/60">New to VoiceOut?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link href="/signup">
                  <Button variant="outline" className="w-full h-12 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className={`grid grid-cols-3 gap-4 mt-8 transform transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/25">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70">Healthcare</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70">Trusted</p>
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center text-sm text-white/50 mt-8 transform transition-all duration-1000 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p>© 2024 VoiceOut. Empowering healthcare communication.</p>
          </div>
        </div>
      </div>
    </div>
  );
}