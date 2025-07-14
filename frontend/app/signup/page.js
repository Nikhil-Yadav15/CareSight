
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/supabase';
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
  UserPlus, 
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
  CheckCircle,
  User,
  Sparkles,
  Star
} from 'lucide-react';

export default function Signup() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  // Animation mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    console.log('Signup page - user:', user);
    if (user) {
      const redirectPath = user.role === 'patient' ? '/patient' : 
                          user.role === 'nurse' ? '/nurse' : '/admin';
      console.log('User already logged in, redirecting to:', redirectPath);
      
      toast.success("Welcome!", {
        description: `Redirecting to your dashboard...`,
        duration: 2000,
        style: {
          backgroundColor: '#16a34a', // green-600
          color: '#ffffff',
        },
      });
      
      router.push(redirectPath);
    }
  }, [user, router]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting sign up with:', formData.email);
      const data = await signUp(formData.email, formData.password, formData.fullName);
      console.log(data)
      
      toast.success("Account created successfully!", {
        description: "Welcome to VoiceOut!",
        duration: 5000,
      });

      
      
      // Auth state change will handle redirect to /patient
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      
      toast.error("Registration failed", {
        description: error.message || "Please try again with different credentials.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
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
          maxSize={1.5}
          particleDensity={400}
          className="w-full h-full"
          particleColor="#10b981"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black/40 to-blue-900/20 z-10"></div>

      {/* Additional Floating Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link href="/">
          <Button variant="ghost" className="text-white/80 cursor-pointer hover:text-white hover:bg-white/10 backdrop-blur-sm">
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
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25 backdrop-blur-sm border border-white/20">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-white to-blue-400 bg-clip-text text-transparent mb-2">
              Join VoiceOut
            </h2>
            <p className="text-white/70 text-lg">
              Create your account and start your healthcare journey
            </p>
          </div>

          {/* Main Signup Card */}
          <Card className={`shadow-2xl border-0 bg-black/40 backdrop-blur-md border-white/10 transform transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-white">
                Patient Registration
              </CardTitle>
              <CardDescription className="text-center text-white/60">
                Fill in your details to create your VoiceOut account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80 font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

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
                      className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm transition-all duration-300"
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
                      className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-green-400 focus:ring-green-400 backdrop-blur-sm transition-all duration-300"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 h-4 w-4 cursor-pointer text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="text-xs text-white/50">
                        Use 8+ characters with uppercase, lowercase, numbers & symbols
                      </div>
                    </div>
                  )}
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
                  className="w-full h-12 cursor-pointer bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Terms & Privacy */}
              <div className="text-center text-xs text-white/50">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-green-400 hover:text-green-300 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-400 hover:text-green-300 underline">
                  Privacy Policy
                </Link>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black/40 px-4 text-white/60">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link href="/login">
                  <Button variant="outline" className="w-full h-12 cursor-pointer border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300">
                    Sign In Instead
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/25">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70">Healthcare</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/25">
                <Star className="w-6 h-6 text-white" />
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
