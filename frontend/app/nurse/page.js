// !UI

"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SparklesCore } from '@/components/ui/sparkles';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { toast } from 'sonner';
import { SignOutButton } from "@/components/LogOut"
import { 
  Stethoscope,
  Users,
  Heart,
  Activity,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Moon,
  Sun,
  Calendar,
  Clock,
  Pill,
  MessageSquare,
  Globe,
  AlertTriangle,
  Smile,
  Eye,
  Hand,
  Volume2,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  FileText,
  UserCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function NurseDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('nurse-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssignedPatients();
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('nurse-theme', newTheme ? 'dark' : 'light');
  };

  const fetchAssignedPatients = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          user:users!patients_user_id_fkey(full_name, email)
        `)
        .eq('assigned_nurse_id', user.id);

      if (error) throw error;
      setPatients(data || []);
      
      toast.success('Patients data updated', {
        description: `${data?.length || 0} patients loaded`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient.id);
    setFormData({
      diagnosis: patient.diagnosis || '',
      medications: patient.medications ? patient.medications.join(', ') : '',
      communication_method: patient.communication_method || 'verbal',
      preferred_language: patient.preferred_language || 'English'
    });
  };

  const handleSave = async (patientId) => {
    try {
      setSaving(true);
      const medicationsArray = formData.medications
        .split(',')
        .map(med => med.trim())
        .filter(med => med.length > 0);

      const { error } = await supabase
        .from('patients')
        .update({
          diagnosis: formData.diagnosis,
          medications: medicationsArray,
          communication_method: formData.communication_method,
          preferred_language: formData.preferred_language
        })
        .eq('id', patientId);

      if (error) throw error;

      setEditingPatient(null);
      fetchAssignedPatients();
      
      toast.success('Patient updated successfully!', {
        description: 'Changes have been saved to the database.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const getCommunicationIcon = (method) => {
    switch (method) {
      case 'eye_gaze': return <Eye className="w-4 h-4" />;
      case 'blink': return <Eye className="w-4 h-4" />;
      case 'gesture': return <Hand className="w-4 h-4" />;
      case 'verbal': return <Volume2 className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getEmotionColor = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'happy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sad': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'angry': return 'bg-red-100 text-red-800 border-red-200';
      case 'anxious': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'calm': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (alert) => {
    if (!alert || alert === 'No alerts') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
        darkMode 
          ? 'bg-black' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-600'}`}>
            Loading your patients...
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
    patientCard: darkMode 
      ? 'bg-black/30 backdrop-blur-md border border-white/10 shadow-xl' 
      : 'bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg'
  };

  return (
    <ProtectedRoute allowedRoles={['nurse']}>
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

        {/* Light mode background elements */}
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
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className={`text-3xl font-bold ${themeClasses.text}`}>
                      Nurse Dashboard
                    </CardTitle>
                    <CardDescription className={`text-lg ${themeClasses.textMuted}`}>
                      Managing care for {patients.length} assigned patients
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-2xl">
                    Welcome, {user?.full_name}
                  </Badge>
                  <Button
                    onClick={fetchAssignedPatients}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className={`${darkMode ? 'border-white/20 cursor-pointer bg-white/10 hover:bg-white/20 text-white' : 'border-blue-200 bg-white/80 hover:bg-blue-50'} transition-all duration-300`}
                  >
                    {refreshing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>{patients.length}</h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Total Patients</p>
              </CardContent>
            </Card>

            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {patients.filter(p => p.last_emotion && p.last_emotion !== 'Not recorded').length}
                </h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Active Monitoring</p>
              </CardContent>
            </Card>

            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {patients.filter(p => p.last_alert && p.last_alert !== 'No alerts').length}
                </h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Active Alerts</p>
              </CardContent>
            </Card>

            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {patients.filter(p => p.diagnosis && p.diagnosis !== 'Not specified').length}
                </h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Diagnosed</p>
              </CardContent>
            </Card>
          </div>

          {/* Patients Section */}
          <Card className={themeClasses.card}>
            <CardHeader>
              <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                <FileText className="w-6 h-6 mr-2" />
                Patient Care Management
              </CardTitle>
              <CardDescription className={themeClasses.textMuted}>
                Monitor and update patient information, medications, and care plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <Card className={`${themeClasses.card} border-2 border-dashed border-blue-200/50`}>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <p className={`${themeClasses.textMuted} text-lg mb-2`}>No patients assigned</p>
                    <p className={`${themeClasses.textMuted} text-sm`}>Contact your administrator for patient assignments</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {patients.map((patient) => (
                    <Card key={patient.id} className={`${themeClasses.patientCard} group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]`}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className={`text-lg font-semibold ${themeClasses.text}`}>
                                {patient.name}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm ${themeClasses.textMuted}`}>
                                  {patient.user?.email}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className="bg-blue-100 text-blue-800">
                              Age: {patient.age || 'N/A'}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              {patient.gender || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Diagnosis Section */}
                        <div className="space-y-2">
                          <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                            <FileText className="w-4 h-4 mr-2" />
                            Diagnosis
                          </Label>
                          {editingPatient === patient.id ? (
                            <Textarea
                              name="diagnosis"
                              value={formData.diagnosis}
                              onChange={handleChange}
                              placeholder="Enter diagnosis..."
                              rows={2}
                              className={`${themeClasses.input} transition-all duration-300`}
                            />
                          ) : (
                            <div className={`p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <p className={`text-sm ${themeClasses.text}`}>
                                {patient.diagnosis || 'Not specified'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Medications Section */}
                        <div className="space-y-2">
                          <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                            <Pill className="w-4 h-4 mr-2" />
                            Medications
                          </Label>
                          {editingPatient === patient.id ? (
                            <Textarea
                              name="medications"
                              value={formData.medications}
                              onChange={handleChange}
                              placeholder="Enter medications separated by commas..."
                              rows={2}
                              className={`${themeClasses.input} transition-all duration-300`}
                            />
                          ) : (
                            <div className={`p-3 rounded-lg border ${darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                              {patient.medications && patient.medications.length > 0 ? (
                                <div className="space-y-1">
                                  {patient.medications.map((med, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className={`text-sm ${themeClasses.text}`}>{med}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className={`text-sm ${themeClasses.textMuted}`}>No medications listed</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Communication & Language */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Communication
                            </Label>
                            {editingPatient === patient.id ? (
                              <Select
                                value={formData.communication_method}
                                onValueChange={(value) => handleSelectChange(value, 'communication_method')}
                              >
                                <SelectTrigger className={`${themeClasses.input} transition-all duration-300`}>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="verbal">
                                    <div className="flex items-center space-x-2">
                                      <Volume2 className="w-4 h-4" />
                                      <span>Verbal</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="eye_gaze">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4" />
                                      <span>Eye Gaze</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="blink">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="w-4 h-4" />
                                      <span>Blink</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="gesture">
                                    <div className="flex items-center space-x-2">
                                      <Hand className="w-4 h-4" />
                                      <span>Gesture</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className={`p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} flex items-center space-x-2`}>
                                {getCommunicationIcon(patient.communication_method)}
                                <span className={`text-sm ${themeClasses.text} capitalize`}>
                                  {patient.communication_method?.replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                              <Globe className="w-4 h-4 mr-2" />
                              Language
                            </Label>
                            {editingPatient === patient.id ? (
                              <Input
                                type="text"
                                name="preferred_language"
                                value={formData.preferred_language}
                                onChange={handleChange}
                                placeholder="Enter language..."
                                className={`${themeClasses.input} transition-all duration-300`}
                              />
                            ) : (
                              <div className={`p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <p className={`text-sm ${themeClasses.text}`}>
                                  {patient.preferred_language}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                              <Smile className="w-4 h-4 mr-2" />
                              Last Emotion
                            </Label>
                            <Badge className={`${getEmotionColor(patient.last_emotion)} w-full justify-center py-2`}>
                              {patient.last_emotion || 'Not recorded'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Last Alert
                            </Label>
                            <Badge className={`${getAlertColor(patient.last_alert)} w-full justify-center py-2`}>
                              {patient.last_alert || 'No alerts'}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/20">
                          {editingPatient === patient.id ? (
                            <>
                              <Button
                                onClick={() => setEditingPatient(null)}
                                variant="outline"
                                size="sm"
                                className={`${darkMode ? 'border-white/20 cursor-pointer bg-white/10 hover:bg-white/20 text-white' : 'border-gray-300 bg-white hover:bg-gray-50'} transition-all duration-300`}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSave(patient.id)}
                                disabled={saving}
                                size="sm"
                                className={`${themeClasses.button} cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
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
                            </>
                          ) : (
                            <Button
                              onClick={() => handleEdit(patient)}
                              size="sm"
                              className={`${themeClasses.button} cursor-pointer text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Patient
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
