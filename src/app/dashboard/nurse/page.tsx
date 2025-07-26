'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import {
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Pill,
  Building2,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  LogOut,
  Bell, // Add Bell icon for alerts
} from 'lucide-react';

// Type definitions remain the same
type Nurse = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone_number: string;
  shift: string;
  hospital_id: string;
  patient_ids: string[];
};

type Hospital = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone_number: string;
};

type Patient = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  age: number;
  gender: string;
  room: string;
  diagnosis: string;
};

type Medication = {
  id: string;
  patient_id: string;
  name: string;
  dosage: any; // jsonb type
  createdat?: string;
  updatedat?: string;
};

type MedicationFormType = {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  instructions: string;
};

// New Alert Type Definition
type Alert = {
  id: string;
  name: string; // This corresponds to the 'name' column in your alerts table
  patient_id: string;
  nurse_id: string;
  hospital_id: string;
  status: 'new' | 'acknowledged' | 'resolved'; // Assuming alert_status_enum
  seen: 'yes' | 'no'; // Assuming alert_seen_enum
  createdat: string;
  updatedat: string;
};


// --- MedicationForm Component Definition (moved outside NurseDashboard for clarity and memoization) ---
interface MedicationFormProps {
  patientId: string;
  initialMedication?: Medication | null; // For editing existing medication
  onSave: (patientId: string, formData: MedicationFormType, medicationId: string | null) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = React.memo(({
  patientId,
  initialMedication,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [medicationForm, setMedicationForm] = useState<MedicationFormType>({
    name: '',
    dosage: '',
    frequency: '',
    timing: '',
    instructions: '',
  });

  // Use useEffect to initialize form when initialMedication changes (for editing)
  useEffect(() => {
    if (initialMedication) {
      const dosageData = initialMedication.dosage || {};
      setMedicationForm({
        name: initialMedication.name,
        dosage: dosageData.amount || '',
        frequency: dosageData.frequency || '',
        timing: dosageData.timing || '',
        instructions: dosageData.instructions || '',
      });
    } else {
      // Reset form when switching to add mode or after saving/canceling
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        timing: '',
        instructions: '',
      });
    }
  }, [initialMedication]); // Dependency array: re-run when initialMedication changes

  const isEditing = !!initialMedication;

  const handleSubmit = async () => {
    if (!medicationForm.name || !medicationForm.dosage) {
      alert('Please fill in medication name and dosage.'); // Use a temporary alert for now
      return;
    }
    await onSave(patientId, medicationForm, isEditing ? initialMedication.id : null);
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mt-4 border border-gray-600 shadow-inner">
      <h6 className="text-base font-semibold text-white mb-4">
        {isEditing ? 'Edit Medication' : 'Add New Medication'}
      </h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Medication name"
          value={medicationForm.name}
          onChange={(e) => setMedicationForm((prev) => ({ ...prev, name: e.target.value }))}
          className="px-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Dosage (e.g., 500mg)"
          value={medicationForm.dosage}
          onChange={(e) => setMedicationForm((prev) => ({ ...prev, dosage: e.target.value }))}
          className="px-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Frequency (e.g., 3 times daily)"
          value={medicationForm.frequency}
          onChange={(e) => setMedicationForm((prev) => ({ ...prev, frequency: e.target.value }))}
          className="px-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Timing (e.g., after meals)"
          value={medicationForm.timing}
          onChange={(e) => setMedicationForm((prev) => ({ ...prev, timing: e.target.value }))}
          className="px-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Special instructions"
          value={medicationForm.instructions}
          onChange={(e) => setMedicationForm((prev) => ({ ...prev, instructions: e.target.value }))}
          className="px-4 py-2.5 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
          rows={2}
        />
      </div>
      <div className="flex gap-3 mt-4 justify-end">
        <button
          onClick={onCancel}
          className="bg-gray-600 text-gray-200 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-500 transition-colors duration-200 flex items-center gap-2 shadow-md"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
        </button>
      </div>
    </div>
  );
});

// --- NurseDashboard Component ---
const NurseDashboard: React.FC = () => {
  const [nurseData, setNurseData] = useState<Nurse | null>(null);
  const [hospitalData, setHospitalData] = useState<Hospital | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Record<string, Medication[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]); // New state for alerts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Medication management states
  const [showMedicationFormForPatient, setShowMedicationFormForPatient] = useState<string | null>(null); // Stores patientId for which form is open
  const [editingMedicationData, setEditingMedicationData] = useState<Medication | null>(null); // Stores medication data if editing

  const [medicationLoading, setMedicationLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Memoize fetchMedications to prevent unnecessary re-creations
  const fetchMedications = useCallback(async (patientIds: string[]) => {
    try {
      const { data: meds, error: medError } = await supabase
        .from('medication')
        .select('*')
        .in('patient_id', patientIds);

      if (medError) throw medError;

      const medMap: Record<string, Medication[]> = {};
      for (const med of meds || []) {
        if (!medMap[med.patient_id]) medMap[med.patient_id] = [];
        medMap[med.patient_id].push(med);
      }

      setMedications(medMap);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  }, [supabase]);

const fetchAlerts = useCallback(async (nurseId: string, patientIds: string[]) => {
    try {
      const { data: alertsData, error: alertsError } = await supabase
        .from('alert') // Change this from 'alerts' to 'alert'
        .select('*')
        .eq('nurse_id', nurseId)
        .in('patient_id', patientIds)
        .order('createdat', { ascending: false }); // Order by newest first

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, [supabase]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');

        if (role !== 'nurse') {
          setError('Access denied. Nurse role required.');
          setLoading(false);
          return;
        }

        if (!userId) {
          setError('No user ID found in localStorage.');
          setLoading(false);
          return;
        }

        // 1. Fetch nurse data
        const { data: nurse, error: nurseError } = await createClient()
          .from('nurse')
          .select('*')
          .eq('id', userId)
          .single();

        if (nurseError || !nurse) throw new Error('Nurse data not found.');
        setNurseData(nurse);

        // 2. Fetch hospital
        const { data: hospital, error: hospitalError } = await supabase
          .from('hospital')
          .select('*')
          .eq('id', nurse.hospital_id)
          .single();

        if (hospitalError || !hospital) throw new Error('Hospital not found.');
        setHospitalData(hospital);

        // 3. Fetch patients
        const { data: patientList, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .in('id', nurse.patient_ids || []);

        if (patientError) throw patientError;
        setPatients(patientList || []);

        // 4. Fetch medications
        await fetchMedications(nurse.patient_ids || []);

        // 5. Fetch alerts for the nurse
        await fetchAlerts(nurse.id, nurse.patient_ids || []);

      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchMedications, fetchAlerts]); // Add fetchAlerts to dependency array

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleMedicationSave = useCallback(async (patientId: string, formData: MedicationFormType, medicationId: string | null) => {
    setMedicationLoading(true);
    setError(null);
    try {
      const dosageData = {
        amount: formData.dosage,
        frequency: formData.frequency,
        timing: formData.timing,
        instructions: formData.instructions,
      };

      if (medicationId) { // Update existing
        const { error: updateError } = await supabase
          .from('medication')
          .update({
            name: formData.name,
            dosage: dosageData,
            updatedat: new Date().toISOString(),
          })
          .eq('id', medicationId);
        if (updateError) throw updateError;
        setSuccessMessage('Medication updated successfully!');
      } else { // Add new
        const { error: insertError } = await supabase
          .from('medication')
          .insert([
            {
              patient_id: patientId,
              name: formData.name,
              dosage: dosageData,
            },
          ])
          .select();
        if (insertError) throw insertError;
        setSuccessMessage('Medication added successfully!');
      }

      await fetchMedications(nurseData?.patient_ids || []); // Refresh medications
      setShowMedicationFormForPatient(null); // Close the form
      setEditingMedicationData(null); // Clear editing state
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving medication:', err);
      setError('Failed to save medication: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setMedicationLoading(false);
    }
  }, [supabase, nurseData, fetchMedications]);


  const handleCancelMedicationForm = useCallback(() => {
    setShowMedicationFormForPatient(null);
    setEditingMedicationData(null);
  }, []);

  const handleEditMedicationClick = useCallback((medication: Medication) => {
    setEditingMedicationData(medication);
    setShowMedicationFormForPatient(medication.patient_id);
  }, []);


  const handleDeleteMedication = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    setMedicationLoading(true);
    try {
      const { error } = await supabase
        .from('medication')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;

      await fetchMedications(nurseData?.patient_ids || []); // Refresh medications
      setSuccessMessage('Medication deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting medication:', err);
      setError('Failed to delete medication: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setMedicationLoading(false);
    }
  };

  // New handler for acknowledging alerts
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('alerts')
        .update({ status: 'acknowledged', seen: 'yes', updatedat: new Date().toISOString() })
        .eq('id', alertId);

      if (updateError) throw updateError;

      // Optimistically update the UI
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, status: 'acknowledged', seen: 'yes' } : alert
        )
      );
      setSuccessMessage('Alert acknowledged!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      setError('Failed to acknowledge alert: ' + err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // New handler for resolving alerts
  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('alerts')
        .update({ status: 'resolved', seen: 'yes', updatedat: new Date().toISOString() })
        .eq('id', alertId);

      if (updateError) throw updateError;

      // Remove the alert from the UI after resolving
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      setSuccessMessage('Alert resolved!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert: ' + err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading nurse dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center max-w-sm w-full border border-gray-700">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Nurse Dashboard</h1>
            <p className="mt-1 text-base text-gray-400">Manage your assigned patients and their medications.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center shadow-md mt-4 sm:mt-0"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Notification */}
        {successMessage && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{successMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage(null)}>
              <X className="h-5 w-5 text-green-200" />
            </span>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
              <X className="h-5 w-5 text-red-200" />
            </span>
          </div>
        )}

        {/* Hospital Info */}
        {hospitalData && (
          <div className="bg-gray-800 rounded-xl shadow-lg mb-8 p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-indigo-400 mr-4 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-white">{hospitalData.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-base text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalData.address}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalData.phone_number}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nurse Info */}
        {nurseData && (
          <div className="bg-gray-800 rounded-xl shadow-lg mb-8 p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-green-400 mr-4 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-white">Nurse Profile: {nurseData.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-base text-gray-300">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span>{nurseData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span>{nurseData.phone_number}</span>
              </div>
              <div className="flex items-center md:col-span-2">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span>
                  Shift: {nurseData.shift ? new Date(nurseData.shift).toLocaleString() : 'Not Assigned'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Section */}
        <section className="mb-8">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Bell className="h-6 w-6 mr-3 text-yellow-400" />
                Patient Alerts ({alerts.filter(alert => alert.status !== 'resolved').length})
              </h3>
            </div>
            <div className="divide-y divide-gray-700">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 py-10">
                  <Bell className="h-10 w-10 mx-auto text-gray-600 mb-4" />
                  <p className="text-lg">No new alerts at this time.</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const patientName = patients.find(p => p.id === alert.patient_id)?.name || 'Unknown Patient';
                  const alertStatusClass = alert.status === 'new' ? 'bg-red-900 text-red-200 border-red-700' :
                                           alert.status === 'acknowledged' ? 'bg-yellow-900 text-yellow-200 border-yellow-700' :
                                           'bg-gray-700 text-gray-400 border-gray-600';
                  const alertSeenStatus = alert.seen === 'no' ? 'Unseen' : 'Seen';
                  const alertTime = new Date(alert.createdat).toLocaleString();

                  return (
                    <div
                      key={alert.id}
                      className={`p-6 transition-all duration-200 hover:bg-gray-700 ${alertStatusClass}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <AlertCircle className="h-6 w-6 flex-shrink-0" />
                          <p className="text-lg font-semibold">{alert.name} from {patientName}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p>Status: <span className="font-medium capitalize">{alert.status}</span></p>
                          <p>Seen: <span className="font-medium">{alertSeenStatus}</span></p>
                          <p>Received: {alertTime}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4 justify-end">
                        {alert.status === 'new' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
                          >
                            <Bell className="h-4 w-4" />
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
                          >
                            <Save className="h-4 w-4" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Patients Section */}
        <section>
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-400" />
                Assigned Patients ({patients.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-700">
              {patients.length === 0 ? (
                <div className="p-6 text-center text-gray-500 py-10">
                  <User className="h-10 w-10 mx-auto text-gray-600 mb-4" />
                  <p className="text-lg">No patients currently assigned to you.</p>
                </div>
              ) : (
                patients.map((patient) => (
                  <div key={patient.id} className="p-6 transition-all duration-200 hover:bg-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        <div className="h-14 w-14 rounded-full bg-blue-900 flex items-center justify-center border border-blue-700 flex-shrink-0">
                          <User className="h-7 w-7 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">{patient.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300 mt-1">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                              {patient.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1.5 text-gray-400" />
                              {patient.phone_number}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                              Room {patient.room}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-gray-200">
                        <div className="text-base font-medium">
                          {patient.age} years old • {patient.gender}
                        </div>
                        <div className="text-md text-gray-100 font-semibold mt-1">
                          Diagnosis: {patient.diagnosis}
                        </div>
                      </div>
                    </div>

                    {/* Medications Section */}
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-base font-semibold text-gray-300 flex items-center">
                          <Pill className="h-5 w-5 mr-2 text-purple-400" />
                          Medications ({medications[patient.id]?.length || 0})
                        </h5>
                        <button
                          onClick={() => {
                            // If clicking "Add Medication" for the current patient and form is already open, close it.
                            // Otherwise, open it for this patient and clear any editing state.
                            if (showMedicationFormForPatient === patient.id && !editingMedicationData) {
                              setShowMedicationFormForPatient(null);
                            } else {
                              setShowMedicationFormForPatient(patient.id);
                              setEditingMedicationData(null); // Always clear editing data when opening 'Add'
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
                        >
                          <Plus className="h-4 w-4" />
                          Add Medication
                        </button>
                      </div>

                      {/* Medication List */}
                      {medications[patient.id]?.length ? (
                        <div className="space-y-3">
                          {medications[patient.id].map((med) => {
                            const dosageData = med.dosage || {};
                            return (
                              <div key={med.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm">
                                <div className="flex-1 mb-3 sm:mb-0">
                                  <p className="font-medium text-white text-lg">{med.name}</p>
                                  <div className="text-sm text-gray-300 mt-1 space-y-1">
                                    <p><strong>Dosage:</strong> {dosageData.amount || 'Not specified'}</p>
                                    {dosageData.frequency && <p><strong>Frequency:</strong> {dosageData.frequency}</p>}
                                    {dosageData.timing && <p><strong>Timing:</strong> {dosageData.timing}</p>}
                                    {dosageData.instructions && <p><strong>Instructions:</strong> {dosageData.instructions}</p>}
                                  </div>
                                </div>
                                <div className="flex gap-3 ml-0 sm:ml-4 flex-shrink-0">
                                  <button
                                    onClick={() => handleEditMedicationClick(med)}
                                    className="bg-blue-700 text-blue-200 px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1 shadow-sm"
                                    title="Edit Medication"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedication(med.id)}
                                    className="bg-red-700 text-red-200 px-3 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1 shadow-sm"
                                    title="Delete Medication"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 flex items-center bg-gray-700 p-3 rounded-md border border-gray-600">
                          <Pill className="h-4 w-4 mr-2 text-gray-500" />
                          No medications assigned for this patient.
                        </p>
                      )}

                      {/* Medication Form */}
                      {showMedicationFormForPatient === patient.id && (
                        <MedicationForm
                          patientId={patient.id}
                          initialMedication={editingMedicationData && editingMedicationData.patient_id === patient.id ? editingMedicationData : null}
                          onSave={handleMedicationSave}
                          onCancel={handleCancelMedicationForm}
                          isLoading={medicationLoading}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NurseDashboard;