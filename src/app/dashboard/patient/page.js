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
  Pill,
} from 'lucide-react';

export default function PatientDashboard() {
  const supabase = createClient();

  const [patientData, setPatientData] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [nurseData, setNurseData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [medications, setMedications] = useState([]);
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('role');

        if (role !== 'patients') {
          setError('Access denied. Patient role required.');
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

        if (patient.hospital_id) {
          const { data: hospital, error: hospitalError } = await supabase
            .from('hospital')
            .select('*')
            .eq('id', patient.hospital_id)
            .single();
          if (hospitalError) console.error('Error fetching hospital:', hospitalError);
          setHospitalData(hospital);
        }

        if (patient.assigned_nurse_ids && patient.assigned_nurse_ids.length > 0) {
          const { data: nurse, error: nurseError } = await supabase
            .from('nurse')
            .select('*')
            .in('id', patient.assigned_nurse_ids)
            .single();
          if (nurseError) console.error('Error fetching nurse:', nurseError);
          setNurseData(nurse);
        }

        setFamilyMembers(patient.family || []);

        const { data: meds, error: medError } = await supabase
          .from('medication')
          .select('*')
          .eq('patient_id', patient.id);

        if (medError) {
          console.error('Error fetching medications:', medError);
        } else {
          setMedications(meds || []);
        }
      } catch (err) {
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
      .update({ phone_number: phone, age: parseInt(age, 10) })
      .eq('id', patientData.id);

    if (!updateError) {
      setPatientData({ ...patientData, phone_number: phone, age: parseInt(age, 10) });
      setEditing(false);
    } else {
      console.error('Error updating patient data:', updateError);
      setError('Failed to update patient data: ' + updateError.message);
    }
    setLoading(false);
  };

  const handleAddFamily = async () => {
    if (!newFamilyMember.name.trim() || !newFamilyMember.email.trim() || !patientData) {
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

  const handleDeleteFamily = async (index) => {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg">Loading patient dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
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
    <div className="min-h-screen bg-white text-gray-800 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header & Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-lg">Patient Dashboard</h1>
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

        {/* Patient Overview Card */}
        {patientData ? (
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-orange-600 flex items-center">
              <User className="h-6 w-6 mr-3 text-orange-600" />
              My Information
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                Name: {patientData.name}
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
                      className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                    <input
                      type="tel"
                      className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-500">No patient data available.</p>
          </div>
        )}

        <hr className="my-8 border-gray-300" />

        {/* Assigned Nurse Card */}
        {nurseData && (
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-emerald-600 flex items-center">
              <Stethoscope className="h-6 w-6 mr-3 text-emerald-600" />
              My Nurse
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                Name: {nurseData.name}
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                Email: {nurseData.email}
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                Phone: {nurseData.phone_number}
              </p>
            </div>
          </div>
        )}

        <hr className="my-8 border-gray-300" />

        {/* Hospital Info Card */}
        {hospitalData && (
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-blue-600" />
              Hospital Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                {hospitalData.name} – {hospitalData.address}
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

        <hr className="my-8 border-gray-300" />

        {/* Medications Card */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-pink-600 flex items-center">
            <Pill className="h-6 w-6 mr-3 text-pink-600" />
            My Medication Schedule
          </h2>
          {medications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{med.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
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
            <p className="text-gray-500">No medications currently assigned.</p>
          )}
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Family Members Card */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 flex items-center">
            <Users className="h-6 w-6 mr-3 text-purple-600" />
            Family Members
          </h2>

          {familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between items-start border border-gray-300">
                  <div className="text-sm text-gray-700 space-y-1 w-full">
                    <p><strong>Name:</strong> {member.name}</p>
                    <p><strong>Email:</strong> {member.email}</p>
                    <p><strong>Phone:</strong> {member.phone_number}</p>
                    <p><strong>Relationship:</strong> {member.relationship}</p>
                    <p>
                      <strong>Emergency Contact:</strong>{' '}
                      <span className={member.is_emergency_contact ? 'text-green-600' : 'text-red-600'}>
                        {member.is_emergency_contact ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                  <button onClick={() => handleDeleteFamily(index)} className="mt-4 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center self-end">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No family members added yet.</p>
          )}

          <div className="mt-6 p-5 bg-white rounded-lg border border-gray-300 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Add New Family Member</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                placeholder="Name"
                className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                value={newFamilyMember.email}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, email: e.target.value })}
                placeholder="Email"
                className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                value={newFamilyMember.phone_number}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, phone_number: e.target.value })}
                placeholder="Phone Number"
                className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                placeholder="Relationship (e.g., Spouse, Parent)"
                className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="inline-flex items-center text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFamilyMember.is_emergency_contact}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, is_emergency_contact: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-200 border-gray-400"
                />
                Emergency Contact
              </label>
              <button onClick={handleAddFamily} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center mt-4" disabled={loading}>
                <Plus className="h-4 w-4 mr-2" /> {loading ? 'Adding...' : 'Add Family Member'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
