"use client";

import React, { useState, useEffect } from 'react';
import { Users, User, Phone, Mail, MapPin, Calendar, AlertCircle, Plus, X, Search, Filter, Save, Building2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get hospital ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');

    if (role !== 'hospital') {
      setError('Access denied. Hospital role required.');
      setLoading(false);
      return;
    }

    if (userId) {
      setHospitalId(userId);
    } else {
      setError('Hospital ID not found in localStorage');
      setLoading(false);
    }
  }, []);

  // Fetch hospital info from Supabase
  const fetchHospitalInfo = async (id) => {
    try {
      const { data, error } = await createClient()
        .from('hospital')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setHospitalInfo(data);
      return data; // Return the hospital data to use in other functions
    } catch (err) {
      setError(`Error fetching hospital info: ${err.message}`);
      console.error('Error fetching hospital info:', err);
      throw err;
    }
  };

  // Fetch patients from Supabase using patient_ids from hospital
  const fetchPatients = async (patientIds) => {
    if (!patientIds || patientIds.length === 0) {
      setPatients([]);
      return;
    }

    try {
      const { data, error } = await createClient()
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      setError(`Error fetching patients: ${err.message}`);
      console.error('Error fetching patients:', err);
    }
  };

  // Fetch nurses from Supabase using nurse_ids from hospital
  const fetchNurses = async (nurseIds) => {
    if (!nurseIds || nurseIds.length === 0) {
      setNurses([]);
      return;
    }

    try {
      const { data, error } = await createClient()
        .from('nurse')
        .select('*')
        .in('id', nurseIds);

      if (error) throw error;
      setNurses(data || []);
    } catch (err) {
      setError(`Error fetching nurses: ${err.message}`);
      console.error('Error fetching nurses:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (hospitalId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // First fetch hospital info
          const hospitalData = await fetchHospitalInfo(hospitalId);

          // Then fetch patients and nurses using the IDs from hospital data
          await Promise.all([
            fetchPatients(hospitalData.patient_ids || []),
            fetchNurses(hospitalData.nurse_ids || [])
          ]);
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [hospitalId]);

  // Assign patient to nurse
  const assignPatientToNurse = async (patientId, nurseId) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      const nurse = nurses.find(n => n.id === nurseId);

      if (!patient || !nurse) {
        throw new Error('Patient or nurse not found');
      }

      // Check if patient is already assigned to this nurse
      if (patient.assigned_nurse_ids && patient.assigned_nurse_ids.includes(nurseId)) {
        setSuccessMessage(null); // Clear any existing success message
        setError('This patient is already assigned to this nurse.');
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        setShowAssignModal(false);
        setSelectedPatient(null);
        setSelectedNurse(null);
        return;
      }

      // Update patient's assigned_nurse_ids
      const updatedPatientNurseIds = [...(patient.assigned_nurse_ids || []), nurseId];

      const { error: patientError } = await createClient()
        .from('patients')
        .update({ assigned_nurse_ids: updatedPatientNurseIds })
        .eq('id', patientId);

      if (patientError) throw patientError;

      // Update nurse's patient_ids
      const updatedNursePatientIds = [...(nurse.patient_ids || []), patientId];

      const { error: nurseError } = await createClient()
        .from('nurse')
        .update({ patient_ids: updatedNursePatientIds })
        .eq('id', nurseId);

      if (nurseError) throw nurseError;

      // Refresh data
      const hospitalData = await fetchHospitalInfo(hospitalId);
      await Promise.all([
        fetchPatients(hospitalData.patient_ids || []),
        fetchNurses(hospitalData.nurse_ids || [])
      ]);

      setShowAssignModal(false);
      setSelectedPatient(null);
      setSelectedNurse(null);

      // Success message
      setError(null); // Clear any existing error message
      setSuccessMessage('Patient successfully assigned to nurse!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
    } catch (err) {
      setSuccessMessage(null); // Clear any existing success message
      setError(`Error assigning patient: ${err.message}`);
      console.error('Error assigning patient:', err);
    }
  };

  // Remove patient from nurse
  const removePatientFromNurse = async (patientId, nurseId) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      const nurse = nurses.find(n => n.id === nurseId);

      if (!patient || !nurse) {
        throw new Error('Patient or nurse not found');
      }

      // Update patient's assigned_nurse_ids
      const updatedPatientNurseIds = (patient.assigned_nurse_ids || []).filter(id => id !== nurseId);

      const { error: patientError } = await createClient()
        .from('patients')
        .update({ assigned_nurse_ids: updatedPatientNurseIds })
        .eq('id', patientId);

      if (patientError) throw patientError;

      // Update nurse's patient_ids
      const updatedNursePatientIds = (nurse.patient_ids || []).filter(id => id !== patientId);

      const { error: nurseError } = await createClient()
        .from('nurse')
        .update({ patient_ids: updatedNursePatientIds })
        .eq('id', nurseId);

      if (nurseError) throw nurseError;

      // Refresh data
      const hospitalData = await fetchHospitalInfo(hospitalId);
      await Promise.all([
        fetchPatients(hospitalData.patient_ids || []),
        fetchNurses(hospitalData.nurse_ids || [])
      ]);

      // Success message
      setError(null); // Clear any existing error message
      setSuccessMessage('Patient successfully unassigned from nurse!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
    } catch (err) {
      setSuccessMessage(null); // Clear any existing success message
      setError(`Error removing assignment: ${err.message}`);
      console.error('Error removing assignment:', err);
    }
  };

  // Get nurse name by ID
  const getNurseNameById = (nurseId) => {
    const nurse = nurses.find(n => n.id === nurseId);
    return nurse ? nurse.name : 'Unknown Nurse';
  };

  // Get patient name by ID
  const getPatientNameById = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Filter patients based on search and filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.room.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'assigned') return matchesSearch && patient.assigned_nurse_ids && patient.assigned_nurse_ids.length > 0;
    if (filterBy === 'unassigned') return matchesSearch && (!patient.assigned_nurse_ids || patient.assigned_nurse_ids.length === 0);

    return matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    window.location.href = '/'; // Redirect to login or homepage
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
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
            <h1 className="text-3xl font-extrabold text-white">Hospital Dashboard</h1>
            <p className="mt-1 text-base text-gray-400">Manage patient assignments and nurse workloads efficiently.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="bg-blue-900 px-4 py-2 rounded-full flex items-center shadow-md border border-blue-700">
              <Users className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm font-semibold text-blue-200">Patients: {patients.length}</span>
            </div>
            <div className="bg-green-900 px-4 py-2 rounded-full flex items-center shadow-md border border-green-700">
              <User className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm font-semibold text-green-200">Nurses: {nurses.length}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center shadow-md"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
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

        {/* Hospital Info Card */}
        {hospitalInfo && (
          <div className="bg-gray-800 rounded-xl shadow-lg mb-8 p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-indigo-400 mr-4 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-white">{hospitalInfo.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6 text-base text-gray-300">
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
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-400" />
                  Patients
                </h2>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Assign Patient
                </button>
              </div>

              {/* Search and Filter */}
              <div className="p-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 border-b border-gray-700">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search patients by name, email, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="appearance-none w-full sm:w-auto pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                  >
                    <option value="all">All Patients</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-700">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div key={patient.id} className="p-6 transition-all duration-200 hover:bg-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                          <div className="h-14 w-14 rounded-full bg-blue-900 flex items-center justify-center border border-blue-700 flex-shrink-0">
                            <User className="h-7 w-7 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
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

                      {/* Assigned Nurses */}
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-300 mb-2">Assigned Nurses:</p>
                        {patient.assigned_nurse_ids && patient.assigned_nurse_ids.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {patient.assigned_nurse_ids.map((nurseId) => (
                              <span
                                key={nurseId}
                                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-900 text-green-200 border border-green-700 shadow-sm"
                              >
                                {getNurseNameById(nurseId)}
                                <button
                                  onClick={() => removePatientFromNurse(patient.id, nurseId)}
                                  className="ml-2 text-green-400 hover:text-green-200 transition-colors duration-200"
                                  title="Unassign nurse"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-red-400 flex items-center bg-red-900 p-2 rounded-md border border-red-700">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            No nurse assigned yet.
                          </span>
                        )}
                      </div>

                      {/* Family Contact */}
                      {patient.family && (
                        <div className="mt-3 text-sm text-gray-400">
                          <span className="font-medium">Emergency Contact:</span> {patient.family.emergency_contact} ({patient.family.relationship})
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 py-10">
                    <Search className="h-10 w-10 mx-auto text-gray-600 mb-4" />
                    <p className="text-lg">No patients found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Nurses Section */}
          <section className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <User className="h-6 w-6 mr-3 text-green-400" />
                  Nurses
                </h2>
              </div>

              <div className="divide-y divide-gray-700">
                {nurses.length > 0 ? (
                  nurses.map((nurse) => (
                    <div key={nurse.id} className="p-6 transition-all duration-200 hover:bg-gray-700">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-green-900 flex items-center justify-center border border-green-700 flex-shrink-0">
                          <User className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{nurse.name}</h3>
                          <div className="text-sm text-gray-300 space-y-1 mt-1">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                              {nurse.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1.5 text-gray-400" />
                              {nurse.phone_number}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Patients */}
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-300 mb-2">
                          Assigned Patients ({nurse.patient_ids ? nurse.patient_ids.length : 0}):
                        </p>
                        {nurse.patient_ids && nurse.patient_ids.length > 0 ? (
                          <div className="space-y-2">
                            {nurse.patient_ids.map((patientId) => (
                              <div key={patientId} className="text-base text-gray-200 flex items-center justify-between bg-gray-700 px-3 py-2 rounded-md border border-gray-600 shadow-sm">
                                <span>{getPatientNameById(patientId)}</span>
                                <button
                                  onClick={() => removePatientFromNurse(patientId, nurse.id)}
                                  className="text-red-400 hover:text-red-200 transition-colors duration-200"
                                  title="Unassign patient"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 flex items-center bg-gray-700 p-2 rounded-md border border-gray-600">
                            No patients currently assigned to this nurse.
                          </span>
                        )}
                      </div>

                      {/* Shift Information */}
                      <div className="mt-3 text-sm text-gray-400 flex items-center pt-3 border-t border-gray-700">
                        <Calendar className="h-4 w-4 inline mr-2 text-gray-500" />
                        <span className="font-medium">Shift:</span> {new Date(nurse.shift).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 py-10">
                    <User className="h-10 w-10 mx-auto text-gray-600 mb-4" />
                    <p className="text-lg">No nurses found in this hospital.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 animate-fade-in-up border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Assign Patient to Nurse</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatient(null);
                  setSelectedNurse(null);
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                title="Close"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="select-patient" className="block text-sm font-medium text-gray-300 mb-2">Select Patient</label>
                <select
                  id="select-patient"
                  value={selectedPatient || ''}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                >
                  <option value="">Choose a patient...</option>
                  {patients.filter(p => !p.assigned_nurse_ids?.includes(selectedNurse)).map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - Room {patient.room}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-nurse" className="block text-sm font-medium text-gray-300 mb-2">Select Nurse</label>
                <select
                  id="select-nurse"
                  value={selectedNurse || ''}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                >
                  <option value="">Choose a nurse...</option>
                  {nurses.filter(n => !n.patient_ids?.includes(selectedPatient)).map((nurse) => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.name} ({nurse.patient_ids ? nurse.patient_ids.length : 0} patients)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPatient(null);
                  setSelectedNurse(null);
                }}
                className="px-5 py-2.5 text-base font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => assignPatientToNurse(selectedPatient, selectedNurse)}
                disabled={!selectedPatient || !selectedNurse}
                className="px-5 py-2.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200 shadow-md"
              >
                <Save className="h-5 w-5 mr-2" />
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;