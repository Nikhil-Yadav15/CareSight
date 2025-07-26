'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import {
  Mail,
  Phone,
  Building2,
  User,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
  Heart,
  Home,
  ClipboardList,
  Calendar,
  Users,
  Stethoscope,
  MapPin,
  Flag,
  Pill, // <--- New: Import Pill icon for medications
} from 'lucide-react';

// --- Type Definitions (Highly Recommended for clarity and type safety) ---
interface Patient {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  age: number;
  gender: string;
  room: string;
  diagnosis: string;
  preferred_lang: string;
  hospital_id: string;
  assigned_nurse_ids: string[];
  family: any[]; // Consider defining a proper type for family members as well
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  email: string;
  phone_number: string;
}

interface Nurse {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  shift: string;
}

interface MedicationDosage {
  amount: string;
  frequency: string;
  timing: string;
  instructions: string;
}

interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: MedicationDosage; // Use the specific Dosage type
  createdat: string;
  updatedat: string;
}

const PatientDashboard: React.FC = () => {
  const supabase = createClient();

  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [hospitalData, setHospitalData] = useState<Hospital | null>(null);
  const [nurseData, setNurseData] = useState<Nurse | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]); // New state for medications
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    email: '',
    address: '',
    phone_number: '',
    relationship: '',
    is_emergency_contact: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');

        if (role !== 'patients') {
          setError('Access denied. Patient role required.');
          console.log('Current role:', role);
          setLoading(false);
          return;
        }

        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', userId)
          .single();

        if (patientError || !patient) {
          throw new Error(`Patient data not found: ${patientError?.message || 'Unknown error'}`);
        }
        setPatientData(patient);
        setPhone(patient.phone_number || '');
        setAge(patient.age || '');

        // Fetch hospital data
        if (patient.hospital_id) {
          const { data: hospital, error: hospitalError } = await supabase
            .from('hospital')
            .select('*')
            .eq('id', patient.hospital_id)
            .single();
          if (hospitalError) console.error('Error fetching hospital:', hospitalError);
          setHospitalData(hospital);
        }

        // Fetch assigned nurse data
        if (patient.assigned_nurse_ids && patient.assigned_nurse_ids.length > 0) {
          const { data: nurse, error: nurseError } = await supabase
            .from('nurse')
            .select('*')
            .in('id', patient.assigned_nurse_ids)
            .single();
          if (nurseError) console.error('Error fetching nurse:', nurseError);
          setNurseData(nurse);
        }

        // Set family members from patient data directly
        setFamilyMembers(patient.family || []);

        // --- NEW: Fetch Medications for this patient ---
        const { data: meds, error: medError } = await supabase
          .from('medication')
          .select('*')
          .eq('patient_id', patient.id); // Fetch medications specific to this patient ID

        if (medError) {
          console.error('Error fetching medications:', medError);
          // Don't throw a critical error if meds don't load, just log it
        } else {
          setMedications(meds || []);
        }
        // --- End NEW ---

      } catch (err: any) {
        console.error('Error in fetchData:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleUpdate = async () => {
    if (!patientData) return;
    setLoading(true);
    const { error: updateError } = await supabase
      .from('patients')
      .update({ phone_number: phone, age: parseInt(age) })
      .eq('id', patientData.id);

    if (!updateError) {
      setPatientData({ ...patientData, phone_number: phone, age: parseInt(age) });
      setEditing(false);
    } else {
      console.error('Error updating patient data:', updateError);
      setError('Failed to update patient data: ' + updateError.message);
    }
    setLoading(false);
  };

  const handleAddFamily = async () => {
    if (
      !newFamilyMember.name.trim() ||
      !newFamilyMember.email.trim() ||
      !patientData
    ) {
      alert('Name and email are required for a family member.');
      return;
    }

    const updatedFamily = [...familyMembers, newFamilyMember];

    setLoading(true);
    const { error: familyUpdateError } = await supabase
      .from('patients')
      .update({ family: updatedFamily })
      .eq('id', patientData.id);

    if (!familyUpdateError) {
      setFamilyMembers(updatedFamily);
      setNewFamilyMember({
        name: '',
        email: '',
        address: '',
        phone_number: '',
        relationship: '',
        is_emergency_contact: false,
      });
    } else {
      console.error('Error updating family:', familyUpdateError);
      setError('Failed to add family member: ' + familyUpdateError.message);
    }
    setLoading(false);
  };

  const handleDeleteFamily = async (index: number) => {
    if (!patientData) return;
    const updated = [...familyMembers];
    updated.splice(index, 1);

    setLoading(true);
    const { error: familyDeleteError } = await supabase
      .from('patients')
      .update({ family: updated })
      .eq('id', patientData.id);

    if (!familyDeleteError) {
      setFamilyMembers(updated);
    } else {
      console.error('Error deleting family member:', familyDeleteError);
      setError('Failed to delete family member: ' + familyDeleteError.message);
    }
    setLoading(false);
  };

  const handleCaresightRedirect = () => {
    window.location.href = '/caresight-verse';
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.error('Error logging out:', logoutError);
      setError('Failed to log out: ' + logoutError.message);
    } else {
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      localStorage.removeItem('user_name');
      window.location.href = '/';
    }
    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg">Loading patient dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-500 p-4">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-xl font-semibold text-center">{error}</p>
        {error.includes('Access denied') && (
          <p className="text-gray-400 mt-2 text-center">
            Please ensure you are logged in with a patient account.
          </p>
        )}
        <button
          onClick={handleLogout}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Patient Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleCaresightRedirect}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Heart className="h-5 w-5" />
              <span>Enter the Verse of Caresight</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-700 text-white px-5 py-3 rounded-xl hover:bg-red-800 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Hospital Info Card */}
        {hospitalData && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-blue-500" />
              {hospitalData.name}
            </h2>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                {hospitalData.address}
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                {hospitalData.email}
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                {hospitalData.phone_number}
              </p>
            </div>
          </div>
        )}

        {/* Assigned Nurse Info Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center">
            <Stethoscope className="h-6 w-6 mr-3 text-green-500" />
            Assigned Nurse
          </h2>
          {nurseData ? (
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                {nurseData.name}
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                {nurseData.email}
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                {nurseData.phone_number}
              </p>
            </div>
          ) : (
            <p className="text-red-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              No nurse currently assigned.
            </p>
          )}
        </div>

        {/* Patient Personal Info Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-orange-400 flex items-center">
            <User className="h-6 w-6 mr-3 text-orange-500" />
            Your Personal Information
          </h2>
          {patientData && (
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                Name: {patientData.name}
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                Email: {patientData.email}
              </p>
              <p className="flex items-center">
                <Home className="h-5 w-5 mr-3 text-gray-500" />
                Room: {patientData.room}
              </p>
              <p className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-3 text-gray-500" />
                Diagnosis: {patientData.diagnosis}
              </p>
              <p className="flex items-center">
                <Flag className="h-5 w-5 mr-3 text-gray-500" />
                Preferred Language: {patientData.preferred_lang}
              </p>

              {editing ? (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    <input
                      type="number"
                      className="flex-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                    <input
                      type="tel"
                      className="flex-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                      onClick={handleUpdate}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    Age: {patientData.age}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                    Phone: {patientData.phone_number}
                  </p>
                  <button
                    className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
                    onClick={() => setEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Info
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        ---

        {/* Medications Card (NEW SECTION) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-pink-400 flex items-center">
            <Pill className="h-6 w-6 mr-3 text-pink-500" />
            Your Medications
          </h2>
          {medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600">
                  <h3 className="text-xl font-semibold text-white mb-2">{med.name}</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>Dosage:</strong> {med.dosage?.amount || 'N/A'}</p>
                    {med.dosage?.frequency && <p><strong>Frequency:</strong> {med.dosage.frequency}</p>}
                    {med.dosage?.timing && <p><strong>Timing:</strong> {med.dosage.timing}</p>}
                    {med.dosage?.instructions && <p><strong>Instructions:</strong> {med.dosage.instructions}</p>}
                    <p className="text-xs text-gray-400 pt-2">
                      Last Updated: {med.updatedat ? new Date(med.updatedat).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No medications currently assigned.</p>
          )}
        </div>

        ---

        {/* Family Members Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center">
            <Users className="h-6 w-6 mr-3 text-purple-500" />
            Family Members
          </h2>

          {familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-5 rounded-lg shadow-md flex flex-col justify-between items-start border border-gray-600"
                >
                  <div className="text-sm text-gray-200 space-y-1 w-full">
                    <p>
                      <strong>Name:</strong> {member.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {member.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {member.phone_number}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {member.relationship}
                    </p>
                    <p>
                      <strong>Emergency Contact:</strong>{' '}
                      <span className={member.is_emergency_contact ? 'text-green-400' : 'text-red-400'}>
                        {member.is_emergency_contact ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFamily(index)}
                    className="mt-4 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center self-end"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mb-4">No family members added yet.</p>
          )}

          <div className="mt-6 p-5 bg-gray-700 rounded-lg border border-gray-600 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Add New Family Member</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                placeholder="Name"
                className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                value={newFamilyMember.email}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, email: e.target.value })}
                placeholder="Email"
                className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                value={newFamilyMember.phone_number}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, phone_number: e.target.value })}
                placeholder="Phone Number"
                className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                placeholder="Relationship (e.g., Spouse, Parent)"
                className="w-full bg-gray-600 text-gray-100 border border-gray-500 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="inline-flex items-center text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFamilyMember.is_emergency_contact}
                  onChange={(e) =>
                    setNewFamilyMember({ ...newFamilyMember, is_emergency_contact: e.target.checked })
                  }
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-500 border-gray-400"
                />
                Emergency Contact
              </label>
              <button
                onClick={handleAddFamily}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center mt-4"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" /> {loading ? 'Adding...' : 'Add Family Member'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;