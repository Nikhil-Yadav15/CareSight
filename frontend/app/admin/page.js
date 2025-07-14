// !UI

"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, createNurse } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SparklesCore } from '@/components/ui/sparkles';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { toast } from 'sonner';
import { SignOutButton } from "@/components/LogOut"
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Settings, 
  Moon, 
  Sun,
  Plus,
  X,
  Save,
  Stethoscope,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddNurse, setShowAddNurse] = useState(false);
  const [nurseForm, setNurseForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [assignments, setAssignments] = useState({});
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('admin-theme', newTheme ? 'dark' : 'light');
  };

  const fetchData = async () => {
    try {
      // Fetch all patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          user:users!patients_user_id_fkey(full_name, email),
          assigned_nurse:users!patients_assigned_nurse_id_fkey(id, full_name, email)
        `);

      if (patientsError) throw patientsError;

      // Fetch all nurses
      const { data: nursesData, error: nursesError } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at')
        .eq('role', 'nurse');

      if (nursesError) throw nursesError;

      console.log('Fetched nurses:', nursesData);
      console.log('Fetched patients:', patientsData);

      setPatients(patientsData || []);
      setNurses(nursesData || []);

      // Initialize assignments
      const initialAssignments = {};
      patientsData?.forEach(patient => {
        initialAssignments[patient.id] = patient.assigned_nurse_id || '';
      });
      setAssignments(initialAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNurse = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      const result = await createNurse(nurseForm.email, nurseForm.password, nurseForm.fullName);
      
      // Add the new nurse to state immediately if we have the data
      if (result.nurse) {
        setNurses(prevNurses => [...prevNurses, result.nurse]);
      }
      
      setNurseForm({ fullName: '', email: '', password: '' });
      setShowAddNurse(false);
      
      toast.success('Nurse created successfully!', {
        description: `${nurseForm.fullName} has been added to the system.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating nurse:', error);
      setError(error.message || 'Error creating nurse');
      toast.error('Failed to create nurse', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignmentChange = (patientId, nurseId) => {
    setAssignments({
      ...assignments,
      [patientId]: nurseId
    });
  };

  const saveAssignment = async (patientId) => {
    try {
      const nurseId = assignments[patientId] || null;
      const { error } = await supabase
        .from('patients')
        .update({ assigned_nurse_id: nurseId })
        .eq('id', patientId);

      if (error) throw error;
      
      toast.success('Assignment updated!', {
        description: 'Patient assignment has been saved.',
        duration: 2000,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to save assignment', {
        description: error.message,
        duration: 3000,
      });
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
        darkMode 
          ? 'bg-black' 
          : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-600'}`}>
            Loading dashboard...
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
    table: darkMode 
      ? 'bg-black/20 border-white/10' 
      : 'bg-white/90 border-blue-100'
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className={`text-3xl font-bold ${themeClasses.text}`}>
                      Admin Dashboard
                    </CardTitle>
                    <CardDescription className={`text-lg ${themeClasses.textMuted}`}>
                      Manage {patients.length} patients and {nurses.length} nurses
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-2xl">
                    Welcome, {user?.full_name}
                  </Badge>
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    size="sm"
                    className={`${darkMode ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' : 'border-blue-200 bg-white/80 hover:bg-blue-50'} cursor-pointer transition-all duration-300`}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  <SignOutButton darkMode={darkMode} />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>{nurses.length}</h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Active Nurses</p>
              </CardContent>
            </Card>

            <Card className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {patients.filter(p => p.assigned_nurse_id).length}
                </h3>
                <p className={`${themeClasses.textMuted} text-sm`}>Assigned Patients</p>
              </CardContent>
            </Card>
          </div>

          {/* Nurse Management */}
          <Card className={`${themeClasses.card} mb-8`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                    <UserPlus className="w-6 h-6 mr-2" />
                    Nurse Management
                  </CardTitle>
                  <CardDescription className={themeClasses.textMuted}>
                    Add new nurses and manage existing staff
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddNurse(!showAddNurse)}
                  className={`${themeClasses.button} text-white shadow-lg hover:shadow-xl transition-all cursor-pointer duration-300 transform hover:scale-105`}
                >
                  {showAddNurse ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Nurse
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {showAddNurse && (
                <Card className={`${themeClasses.card} mb-6 border-2 border-blue-200/50`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${themeClasses.text}`}>Create New Nurse Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert className="border-red-400/50 bg-red-500/10 mb-4">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-600">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleAddNurse} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className={`${themeClasses.text} font-medium`}>
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="fullName"
                              type="text"
                              required
                              value={nurseForm.fullName}
                              onChange={(e) => setNurseForm({...nurseForm, fullName: e.target.value})}
                              placeholder="Enter nurse's full name"
                              className={`pl-10 h-12 ${themeClasses.input} transition-all duration-300`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className={`${themeClasses.text} font-medium`}>
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              required
                              value={nurseForm.email}
                              onChange={(e) => setNurseForm({...nurseForm, email: e.target.value})}
                              placeholder="Enter nurse's email"
                              className={`pl-10 h-12 ${themeClasses.input} transition-all duration-300`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className={`${themeClasses.text} font-medium`}>
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={nurseForm.password}
                            onChange={(e) => setNurseForm({...nurseForm, password: e.target.value})}
                            placeholder="Enter nurse's password"
                            className={`pl-10 pr-10 h-12 ${themeClasses.input} transition-all duration-300`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 cursor-pointer h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={createLoading}
                        className={`w-full h-12 ${themeClasses.button} text-white cursor-pointer font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50`}
                      >
                        {createLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Nurse Account
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Nurses List */}
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Current Nurses</h3>
                {nurses.length === 0 ? (
                  <Card className={`${themeClasses.card} border-2 border-dashed border-blue-200/50`}>
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <p className={`${themeClasses.textMuted} text-lg mb-2`}>No nurses found</p>
                      <p className={`${themeClasses.textMuted} text-sm`}>Create your first nurse account above</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nurses.map((nurse) => (
                      <Card key={nurse.id} className={`${themeClasses.card} group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${themeClasses.text}`}>{nurse.full_name}</h4>
                              <p className={`text-sm ${themeClasses.textMuted}`}>{nurse.email}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${themeClasses.textMuted}`}>Patients:</span>
                              <Badge className="bg-blue-100 text-blue-800">
                                {patients.filter(p => p.assigned_nurse_id === nurse.id).length}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm ${themeClasses.textMuted}`}>Joined:</span>
                              <span className={`text-sm ${themeClasses.textMuted}`}>
                                {new Date(nurse.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient Assignments */}
          <Card className={themeClasses.card}>
            <CardHeader>
              <CardTitle className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
                <Settings className="w-6 h-6 mr-2" />
                Patient Assignments
              </CardTitle>
              <CardDescription className={themeClasses.textMuted}>
                Assign patients to nurses for better care coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/20">
                  <thead className={`${themeClasses.table} backdrop-blur-sm`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Patient
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Contact
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Details
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Assigned Nurse
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${themeClasses.table} divide-y divide-gray-200/20 backdrop-blur-sm`}>
                    {patients.map((patient, index) => (
                      <tr key={patient.id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.text}`}>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            {patient.name}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textMuted}`}>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {patient.user?.email}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textMuted}`}>
                          <div className="space-y-1">
                            <div>Age: {patient.age || 'N/A'}</div>
                            <div>Gender: {patient.gender || 'N/A'}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textMuted}`}>
                          <select
                            value={assignments[patient.id] || ''}
                            onChange={(e) => handleAssignmentChange(patient.id, e.target.value)}
                            className={`block w-full px-3 py-2 rounded-md ${themeClasses.input} text-sm transition-all duration-300`}
                          >
                            <option value="">Unassigned</option>
                            {nurses.map((nurse) => (
                              <option key={nurse.id} value={nurse.id}>
                                {nurse.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            onClick={() => saveAssignment(patient.id)}
                            size="sm"
                            className={`${themeClasses.button} cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
