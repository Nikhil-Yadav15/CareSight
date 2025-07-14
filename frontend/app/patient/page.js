"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SignOutButton } from "@/components/LogOut"
import { 
  User, 
  Heart, 
  UserCheck, 
  Moon, 
  Sun, 
  Edit3, 
  Save, 
  X, 
  Stethoscope, 
  Activity, 
  Calendar, 
  Phone, 
  FileText, 
  UserCircle, 
  Languages, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Pill, 
  Upload, 
  Loader2,
  Clock 
} from 'lucide-react';

import dynamic from 'next/dynamic';

const BackgroundBeams = dynamic(() =>
  import('@/components/ui/background-beams').then((mod) => mod.BackgroundBeams),
  { ssr: false }
);

const SparklesCore = dynamic(() =>
  import('@/components/ui/sparkles').then((mod) => mod.SparklesCore),
  { ssr: false }
);

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [assignedNurse, setAssignedNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    preferred_language: '',
    communication_method: '',
    photo_url: ''
  });

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('patient-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('patient-theme', newTheme ? 'dark' : 'light');
  };

  const fetchPatientData = async () => {
    try {
      let { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            name: user.full_name
          })
          .select()
          .single();

        if (createError) throw createError;
        patient = newPatient;
      } else if (error) {
        throw error;
      }

      setPatientData(patient);
      setFormData({
        age: patient.age || '',
        gender: patient.gender || '',
        preferred_language: patient.preferred_language || 'English',
        communication_method: patient.communication_method || 'verbal',
        photo_url: patient.photo_url || ''
      });

      if (patient.assigned_nurse_id) {
        const { data: nurse, error: nurseError } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', String(patient.assigned_nurse_id))
          .maybeSingle();

        if (!nurseError) {
          setAssignedNurse(nurse);
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError(error.message);
      toast.error('Failed to load patient data', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('patients')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;

      setPatientData({ ...patientData, ...formData });
      setEditing(false);
      toast.success('Profile updated successfully!', {
        description: 'Your information has been saved.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating patient data:', error);
      setError(error.message);
      toast.error('Failed to update profile', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCancel = () => {
    setFormData({
      age: patientData.age || '',
      gender: patientData.gender || '',
      preferred_language: patientData.preferred_language || 'English',
      communication_method: patientData.communication_method || 'verbal',
      photo_url: patientData.photo_url || ''
    });
    setEditing(false);
    setError(null);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, photo_url: publicUrl });
      await supabase
        .from('patients')
        .update({ photo_url: publicUrl })
        .eq('user_id', user.id);

      setPatientData({ ...patientData, photo_url: publicUrl });
      toast.success('Photo uploaded successfully!', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error.message);
      toast.error('Failed to upload photo', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-600'}`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const themeClasses = {
    container: darkMode 
      ? 'min-h-screen bg-black relative overflow-hidden' 
      : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50',
    card: darkMode 
      ? 'bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl' 
      : 'bg-white/80 backdrop-blur-sm border border-blue-100 shadow-xl',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-white/70' : 'text-gray-600',
    input: darkMode 
      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400' 
      : 'bg-white/80 border-blue-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500',
    button: darkMode 
      ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600' 
      : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700',
    readOnly: darkMode 
      ? 'bg-white/5 border-white/10 text-white/80' 
      : 'bg-gray-50 border-gray-200 text-gray-700'
  };

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className={themeClasses.container}>
        {/* Background Effects */}
        {darkMode && (
          <>
            <BackgroundBeams className="absolute inset-0 z-0" />
            <div className="absolute inset-0 z-0">
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={800}
                className="w-full h-full"
                particleColor="#3b82f6"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black/40 to-green-900/20 z-10"></div>
          </>
        )}
        {!darkMode && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto p-6">
          {/* Header */}
          <Card className={`${themeClasses.card} mb-8 transform transition-all duration-300`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className={`text-3xl font-bold ${themeClasses.text}`}>
                      Patient Dashboard
                    </CardTitle>
                    <CardDescription className={`text-lg ${themeClasses.textMuted}`}>
                      Welcome back, {user?.full_name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-2xl">
                    <Activity className="w-3 h-3 mr-1" />
                    Active Patient
                  </Badge>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                    className={`${darkMode ? 'border-white/20 cursor-pointer bg-white/10 hover:bg-white/20 text-white' : 'border-blue-200 bg-white/80 hover:bg-blue-50'} transition-all duration-300`}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                    <SignOutButton darkMode={darkMode} />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>Profile</h3>
                <p className={`${themeClasses.textMuted} text-sm`}>
                  {patientData?.age ? `${patientData.age} years old` : 'Complete profile'}
                </p>
              </CardContent>
            </Card>
            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>Nurse</h3>
                <p className={`${themeClasses.textMuted} text-sm`}>
                  {assignedNurse ? 'Assigned' : 'Not assigned'}
                </p>
              </CardContent>
            </Card>
            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>Language</h3>
                <p className={`${themeClasses.textMuted} text-sm`}>
                  {patientData?.preferred_language || 'English'}
                </p>
              </CardContent>
            </Card>
            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${themeClasses.text}`}>Communication</h3>
                <p className={`${themeClasses.textMuted} text-sm capitalize`}>
                  {patientData?.communication_method || 'Verbal'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card className={`${themeClasses.card} transform transition-all duration-300`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                      <User className="w-6 h-6 mr-2" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className={themeClasses.textMuted}>
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  {!editing && (
                    <Button
                      onClick={() => setEditing(true)}
                      className={`${themeClasses.button} text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert className="border-red-400/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-600">{error}</AlertDescription>
                  </Alert>
                )}
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={`${themeClasses.text} font-medium flex items-center`}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={patientData?.name || user.full_name}
                    disabled
                    className={`h-12 ${themeClasses.readOnly} cursor-not-allowed`}
                  />
                </div>
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo" className={`${themeClasses.text} font-medium flex items-center`}>
                    <Upload className="w-4 h-4 mr-2" />
                    Profile Photo
                  </Label>
                  <div className="flex items-center space-x-4">
                    {formData.photo_url ? (
                      <img
                        src={formData.photo_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200/50"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-white" />
                      </div>
                    )}
                    {editing && (
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className={`h-12 ${themeClasses.input}`}
                      />
                    )}
                  </div>
                  {uploading && (
                    <div className="flex items-center space-x-2 text-sm text-blue-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className={`${themeClasses.text} font-medium flex items-center`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your age"
                    className={`h-12 ${editing ? themeClasses.input : themeClasses.readOnly} transition-all duration-300`}
                  />
                </div>
                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className={`${themeClasses.text} font-medium flex items-center`}>
                    <User className="w-4 h-4 mr-2" />
                    Gender
                  </Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                    disabled={!editing}
                  >
                    <SelectTrigger className={`h-12 ${editing ? themeClasses.input : themeClasses.readOnly}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Preferred Language */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_language" className={`${themeClasses.text} font-medium flex items-center`}>
                    <Languages className="w-4 h-4 mr-2" />
                    Preferred Language
                  </Label>
                  <Input
                    id="preferred_language"
                    type="text"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={(e) => handleChange('preferred_language', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter your preferred language"
                    className={`h-12 ${editing ? themeClasses.input : themeClasses.readOnly} transition-all duration-300`}
                  />
                </div>
                {/* Communication Method */}
                <div className="space-y-2">
                  <Label htmlFor="communication_method" className={`${themeClasses.text} font-medium flex items-center`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Communication Method
                  </Label>
                  <Select
                    name="communication_method"
                    value={formData.communication_method}
                    onValueChange={(value) => handleChange('communication_method', value)}
                    disabled={!editing}
                  >
                    <SelectTrigger className={`h-12 ${editing ? themeClasses.input : themeClasses.readOnly}`}>
                      <SelectValue placeholder="Select communication method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verbal">Verbal</SelectItem>
                      <SelectItem value="eye_gaze">Eye Gaze</SelectItem>
                      <SelectItem value="blink">Blink</SelectItem>
                      <SelectItem value="gesture">Gesture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Action Buttons */}
                {editing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className={`${darkMode ? 'border-white/20 cursor-pointer bg-white/10 hover:bg-white/20 text-white' : 'border-gray-300 bg-white hover:bg-gray-50'} transition-all duration-300`}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || uploading}
                      className={`${themeClasses.button} cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50`}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Medical Information */}
            <Card className={`${themeClasses.card} transform transition-all duration-300`}>
              <CardHeader>
                <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                  <Heart className="w-6 h-6 mr-2" />
                  Medical Information
                </CardTitle>
                <CardDescription className={themeClasses.textMuted}>
                  View your medical details and assigned care team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assigned Nurse */}
                <div className="space-y-2">
                  <Label className={`${themeClasses.text} font-medium flex items-center`}>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Assigned Nurse
                  </Label>
                  <Card className={`${themeClasses.card} border-2 ${assignedNurse ? 'border-green-200/50' : 'border-yellow-200/50'}`}>
                    <CardContent className="p-4">
                      {assignedNurse ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${themeClasses.text}`}>{assignedNurse.full_name}</h4>
                            <p className={`text-sm ${themeClasses.textMuted}`}>{assignedNurse.email}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${themeClasses.text}`}>Not Assigned</h4>
                            <p className={`text-sm ${themeClasses.textMuted}`}>A nurse will be assigned soon</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* Medications */}
                <div className="space-y-2">
                  <Label className={`${themeClasses.text} font-medium flex items-center`}>
                    <Pill className="w-4 h-4 mr-2" />
                    Medications
                  </Label>
                  <Card className={`${themeClasses.card} border-2 border-blue-200/50`}>
                    <CardContent className="p-4">
                      <Alert className="border-blue-400/50 bg-blue-500/10 mb-3">
                        <AlertCircle className="h-4 w-4 text-blue-400" />
                        <AlertDescription className={`${themeClasses.textMuted} text-sm`}>
                          Medication information is managed by your healthcare team
                        </AlertDescription>
                      </Alert>
                      {patientData?.medications && patientData.medications.length > 0 ? (
                        <div className="space-y-2">
                          {patientData.medications.map((med, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className={`text-sm ${themeClasses.text}`}>{med}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                            <Pill className="w-6 h-6 text-white" />
                          </div>
                          <p className={`${themeClasses.textMuted} text-sm`}>No medications listed</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* Diagnosis */}
                <div className="space-y-2">
                  <Label className={`${themeClasses.text} font-medium flex items-center`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Diagnosis
                  </Label>
                  <Card className={`${themeClasses.card} border-2 border-purple-200/50`}>
                    <CardContent className="p-4">
                      {patientData?.diagnosis ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className={`${themeClasses.text} font-medium`}>{patientData.diagnosis}</p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>Current diagnosis</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <p className={`${themeClasses.textMuted} text-sm`}>No diagnosis specified</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className={`${themeClasses.card} mt-8`}>
            <CardHeader>
              <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                <Clock className="w-6 h-6 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription className={themeClasses.textMuted}>
                Access important features and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Emergency Contact</h3>
                    <p className={`text-sm ${themeClasses.textMuted}`}>Quick access to emergency services</p>
                    <Button
                      className={`mt-3 ${themeClasses.button} cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      onClick={() => toast.info('Contacting emergency services...', { duration: 3000 })}
                    >
                      Call Now
                    </Button>
                  </CardContent>
                </Card>
                <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Schedule Appointment</h3>
                    <p className={`text-sm ${themeClasses.textMuted}`}>Book a new appointment with your nurse</p>
                    <Button
                      className={`mt-3 ${themeClasses.button} cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      onClick={() => toast.info('Appointment scheduling coming soon!', { duration: 3000 })}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
                <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Health Records</h3>
                    <p className={`text-sm ${themeClasses.textMuted}`}>View your medical history and records</p>
                    <Button
                      className={`mt-3 ${themeClasses.button} cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      onClick={() => toast.info('Health records access coming soon!', { duration: 3000 })}
                    >
                      View Records
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
