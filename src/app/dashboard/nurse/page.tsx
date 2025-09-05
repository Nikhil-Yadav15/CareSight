'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import {
  User,
  Users,
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
  Bell,
  Search,
} from 'lucide-react';

// Supabase client
const supabase = createClient();

// Type definitions (kept the same)
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
  dosage: any;
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

type Alert = {
  id: string;
  name: string;
  patient_id: string;
  nurse_id: string;
  hospital_id: string;
  status: 'new' | 'acknowledged' | 'resolved';
  seen: 'yes' | 'no';
  createdat: string;
  updatedat: string;
};

// --- MedicationForm Component Definition ---
interface MedicationFormProps {
  patientId: string;
  initialMedication?: Medication | null;
  onSave: (patientId: string, formData: MedicationFormType, medicationId: string | null) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
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
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        timing: '',
        instructions: '',
      });
    }
  }, [initialMedication]);

  const isEditing = !!initialMedication;

  const handleSubmit = async () => {
    const dosageData = {
      amount: medicationForm.dosage,
      frequency: medicationForm.frequency,
      timing: medicationForm.timing,
      instructions: medicationForm.instructions,
    };
    await onSave(
      patientId,
      { ...medicationForm, dosage: JSON.stringify(dosageData) },
      initialMedication?.id || null
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
          <input
            id="name"
            type="text"
            value={medicationForm.name}
            onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dosage Amount</label>
          <input
            id="dosage"
            type="text"
            value={medicationForm.dosage}
            onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <input
            id="frequency"
            type="text"
            value={medicationForm.frequency}
            onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="timing" className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
          <input
            id="timing"
            type="text"
            value={medicationForm.timing}
            onChange={(e) => setMedicationForm({ ...medicationForm, timing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          id="instructions"
          rows={3}
          value={medicationForm.instructions}
          onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 flex items-center shadow-md ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Medication'}
        </button>
      </div>
    </div>
  );
};

// --- NurseDashboard Component ---
const NurseDashboard = () => {
  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hospitalInfo, setHospitalInfo] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const nurseId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  const fetchNurseData = useCallback(async () => {
    if (!nurseId) {
      setError('Nurse ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const { data: nurseData, error: nurseError } = await supabase
        .from('nurse')
        .select('*')
        .eq('id', nurseId)
        .single();

      if (nurseError) throw nurseError;

      setNurse(nurseData);

      // Fetch hospital info
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospital')
        .select('*')
        .eq('id', nurseData.hospital_id)
        .single();
      if (hospitalError) throw hospitalError;
      setHospitalInfo(hospitalData);

      // Fetch patients and medications
      if (nurseData.patient_ids && nurseData.patient_ids.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .in('id', nurseData.patient_ids);
        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        const { data: medicationsData, error: medicationsError } = await supabase
          .from('medication')
          .select('*')
          .in('patient_id', nurseData.patient_ids);
        if (medicationsError) throw medicationsError;
        setMedications(medicationsData || []);
      } else {
        setPatients([]);
        setMedications([]);
      }

      // Fetch alerts for this nurse
      const { data: alertsData, error: alertsError } = await supabase
        .from('alert') // CORRECTED: Changed 'alerts' to 'alert'
        .select('*')
        .eq('nurse_id', nurseId)
        .order('createdat', { ascending: false });
      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [nurseId]);

  useEffect(() => {
    fetchNurseData();
  }, [fetchNurseData]);

  const handleMedicationSave = async (patientId: string, formData: MedicationFormType, medicationId: string | null) => {
    setLoading(true);
    try {
      const { name, dosage, frequency, timing, instructions } = formData;
      const dosageData = { amount: dosage, frequency, timing, instructions };

      if (medicationId) {
        // Update existing medication
        const { error: updateError } = await supabase
          .from('medication')
          .update({ name, dosage: dosageData })
          .eq('id', medicationId);
        if (updateError) throw updateError;
        setSuccessMessage('Medication updated successfully!');
      } else {
        // Add new medication
        const { error: insertError } = await supabase
          .from('medication')
          .insert({ name, dosage: dosageData, patient_id: patientId });
        if (insertError) throw insertError;
        setSuccessMessage('Medication added successfully!');
      }

      await fetchNurseData();
      setShowMedicationModal(false);
      setSelectedPatient(null);
      setEditingMedication(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (err) {
      setError(`Error saving medication: ${err.message}`);
      setSuccessMessage(null);
      console.error('Error saving medication:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationDelete = async (medicationId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      setLoading(true);
      try {
        const { error: deleteError } = await supabase
          .from('medication')
          .delete()
          .eq('id', medicationId);
        if (deleteError) throw deleteError;
        setSuccessMessage('Medication deleted successfully!');
        await fetchNurseData();
        setTimeout(() => setSuccessMessage(null), 3000);
        setError(null);
      } catch (err) {
        setError(`Error deleting medication: ${err.message}`);
        setSuccessMessage(null);
        console.error('Error deleting medication:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('alert') // CORRECTED: Changed 'alerts' to 'alert'
        .update({ status: 'acknowledged' })
        .eq('id', alertId);
      if (updateError) throw updateError;
      await fetchNurseData();
    } catch (err) {
      setError(`Error acknowledging alert: ${err.message}`);
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const getPatientNameById = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-sm w-full border border-gray-200">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-500">{error}</p>
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
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Nurse Dashboard</h1>
            <p className="mt-1 text-base text-gray-500">Manage patient care and medication plans efficiently.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center shadow-sm border border-blue-200">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-800">Assigned Patients: {patients.length}</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-full flex items-center shadow-sm border border-green-200">
              <User className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-800">Hi, {nurse?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center shadow-md"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Notification */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{successMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage(null)}>
              <X className="h-5 w-5 text-green-600" />
            </span>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
              <X className="h-5 w-5 text-red-600" />
            </span>
          </div>
        )}

        {/* Hospital Info Card */}
        {hospitalInfo && (
          <div className="bg-white rounded-xl shadow-md mb-8 p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-indigo-600 mr-4 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">{hospitalInfo.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-base text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalInfo.address}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span>{hospitalInfo.phone_number}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patients Section */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  My Patients
                </h2>
              </div>

              {/* Patient List */}
              <div className="divide-y divide-gray-200">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <div key={patient.id} className="p-6 transition-all duration-200 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center border border-blue-300 flex-shrink-0">
                            <User className="h-7 w-7 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
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
                        <div className="text-left sm:text-right text-gray-800">
                          <div className="text-md text-gray-900 font-semibold mt-1">
                            Diagnosis: {patient.diagnosis}
                          </div>
                          <div className="text-base font-medium mt-1">
                            {patient.age} years old • {patient.gender}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setEditingMedication(null);
                              setShowMedicationModal(true);
                            }}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md ml-auto"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Medication
                          </button>
                        </div>
                      </div>

                      {/* Medication List */}
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Medication Plan:</p>
                        {medications.filter(m => m.patient_id === patient.id).length > 0 ? (
                          <div className="space-y-2">
                            {medications
                              .filter(m => m.patient_id === patient.id)
                              .map((med) => {
                                const dosageInfo = med.dosage || {};
                                return (
                                  <div key={med.id} className="bg-gray-100 p-3 rounded-md border border-gray-200 shadow-sm flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                                        <Pill className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{med.name}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 pl-6">
                                        <span className="font-medium">Dosage:</span> {dosageInfo.amount || 'N/A'} - {dosageInfo.frequency || 'N/A'}
                                        <br />
                                        <span className="font-medium">Timing:</span> {dosageInfo.timing || 'N/A'}
                                        <br />
                                        <span className="font-medium">Instructions:</span> {dosageInfo.instructions || 'N/A'}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                      <button
                                        onClick={() => {
                                          setSelectedPatient(patient);
                                          setEditingMedication(med);
                                          setShowMedicationModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Edit medication"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleMedicationDelete(med.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="Delete medication"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <span className="text-sm text-red-600 flex items-center bg-red-100 p-2 rounded-md border border-red-300">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            No medications added for this patient.
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 py-10">
                    <Search className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg">You have no patients assigned yet.</p>
                    <p className="mt-2 text-sm">Please contact your hospital administrator for patient assignments.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Alerts Section */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bell className="h-6 w-6 mr-3 text-red-600" />
                  Alerts
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-6 transition-all duration-200 hover:bg-gray-50 ${alert.status === 'new' ? 'bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.status === 'new' ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
                            <AlertCircle className={`h-5 w-5 ${alert.status === 'new' ? 'text-red-600' : 'text-green-600'}`} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                        </div>
                        {alert.status === 'new' && (
                          <button
                            onClick={() => handleAlertAcknowledge(alert.id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-md"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Patient:</span> {getPatientNameById(alert.patient_id)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Status:</span>
                        <span className={`ml-1 font-semibold ${alert.status === 'new' ? 'text-red-600' : 'text-green-600'}`}>
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(alert.createdat).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 py-10">
                    <Bell className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg">No new alerts.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Medication Modal */}
      {showMedicationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 animate-fade-in-up border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{editingMedication ? 'Edit' : 'Add'} Medication</h3>
              <button
                onClick={() => {
                  setShowMedicationModal(false);
                  setSelectedPatient(null);
                  setEditingMedication(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Close"
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">For Patient:</span> {selectedPatient.name}
            </p>
            <MedicationForm
              patientId={selectedPatient.id}
              initialMedication={editingMedication}
              onSave={handleMedicationSave}
              onCancel={() => {
                setShowMedicationModal(false);
                setSelectedPatient(null);
                setEditingMedication(null);
              }}
              isLoading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;