"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, User, Mail, Lock, Phone, MapPin, Calendar, Activity, Home, Camera, Users, Plus, Minus, Hospital } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('hospital');
  const [form, setForm] = useState<any>({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    nurse_ids: [],
    patient_ids: [],
    assigned_nurse_ids: [],
    age: '',
    gender: '',
    room: '',
    diagnosis: '',
    preferred_lang: 'English',
    photo_file: null,
    photo_url: '',
    family: [],
    hospital_name_input: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const diagnosisOptions = [
    { value: '', label: 'Select Diagnosis' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'heart_disease', label: 'Heart Disease' },
    { value: 'asthma', label: 'Asthma' },
    { value: 'pneumonia', label: 'Pneumonia' },
    { value: 'covid19', label: 'COVID-19' },
    { value: 'fracture', label: 'Fracture' },
    { value: 'surgery_recovery', label: 'Surgery Recovery' },
    { value: 'cancer', label: 'Cancer' },
    { value: 'stroke', label: 'Stroke' },
    { value: 'kidney_disease', label: 'Kidney Disease' },
    { value: 'liver_disease', label: 'Liver Disease' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'other', label: 'Other' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Arabic', label: 'Arabic' }
  ];

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'friend', label: 'Friend' },
    { value: 'emergency_contact', label: 'Emergency Contact' },
    { value: 'other', label: 'Other' }
  ];

  // Function to get dashboard route based on role
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'hospital':
        return '/dashboard/hospital';
      case 'nurse':
        return '/dashboard/nurse';
      case 'patients':
        return '/dashboard/patient';
      default:
        return '/dashboard';
    }
  };

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setForm({ ...form, photo_file: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Family member functions
  const addFamilyMember = () => {
    const newMember = {
      name: '',
      relationship: '',
      phone_number: '',
      email: '',
      address: '',
      is_emergency_contact: false
    };
    setForm({
      ...form,
      family: [...form.family, newMember]
    });
  };

  const removeFamilyMember = (index: number) => {
    const updatedFamily = form.family.filter((_: any, i: number) => i !== index);
    setForm({ ...form, family: updatedFamily });
  };

  const updateFamilyMember = (index: number, field: string, value: any) => {
    const updatedFamily = form.family.map((member: any, i: number) =>
      i === index ? { ...member, [field]: value } : member
    );
    setForm({ ...form, family: updatedFamily });
  };

  // Fetch hospital list once for nurse/patient registration
  useEffect(() => {
    async function fetchHospitals() {
      const { data } = await supabase.from('hospital').select('id, name');
      if (data) {
        setHospitals(data);
      }
    }

    if (role !== 'hospital') fetchHospitals();
  }, [role]);

  const handleRegister = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.password || !form.phone_number) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    let payload = { ...form };

    try {
      if (role === 'hospital') {
        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          address: form.address,
          phone_number: form.phone_number,
          nurse_ids: [],
          patient_ids: [],
        };
      }

      else if (role === 'nurse') {
        const match = hospitals.find(
          (h: any) => h.name.toLowerCase() === form.hospital_name_input.toLowerCase()
        );

        if (!match) {
          alert('❌ Hospital name not found!');
          setIsLoading(false);
          return;
        }

        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number,
          hospital_id: match.id,
          alert_ids: [],
          shift: new Date().toISOString(),
          patient_ids: [],
        };
      }

      else if (role === 'patients') {
        const match = hospitals.find(
          (h: any) => h.name.toLowerCase() === form.hospital_name_input.toLowerCase()
        );

        if (!match) {
          alert('❌ Hospital name not found!');
          setIsLoading(false);
          return;
        }

        // Upload image to Supabase Storage
        let photo_url = form.photo_url;
        if (form.photo_file) {
          const fileExt = form.photo_file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `patient_photos/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('patient-photos') // Bucket name
            .upload(filePath, form.photo_file);

          if (uploadError) {
            alert('❌ Image Upload Failed');
            setIsLoading(false);
            return;
          }

          const { data: publicURLData } = supabase
            .storage
            .from('patient-photos')
            .getPublicUrl(filePath);

          photo_url = publicURLData?.publicUrl || '';
        }

        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number,
          age: parseInt(form.age),
          gender: form.gender,
          room: form.room,
          diagnosis: form.diagnosis,
          preferred_lang: form.preferred_lang,
          photo_url: photo_url,
          hospital_id: match.id,
          assigned_nurse_ids: [],
          family: form.family,
        };
      }

      const table =
        role === 'hospital' ? 'hospital' : role === 'nurse' ? 'nurse' : 'patients';

      // Insert the new record
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([payload])
        .select();

      if (error) {
        alert('❌ Error: ' + error.message);
        setIsLoading(false);
        return;
      }

      // Update hospital's nurse_ids or patient_ids array
      if (role === 'nurse' || role === 'patients') {
        const match = hospitals.find(
          (h: any) => h.name.toLowerCase() === form.hospital_name_input.toLowerCase()
        );

        if (match && insertedData && insertedData.length > 0) {
          const newUserId = insertedData[0].id;

          // Get current hospital data
          const { data: hospitalData, error: hospitalFetchError } = await supabase
            .from('hospital')
            .select('nurse_ids, patient_ids')
            .eq('id', match.id)
            .single();

          if (hospitalFetchError) {
            alert('❌ Error fetching hospital data: ' + hospitalFetchError.message);
            setIsLoading(false);
            return;
          }

          // Update the appropriate array
          let updateData = {};
          if (role === 'nurse') {
            const updatedNurseIds = [...(hospitalData.nurse_ids || []), newUserId];
            updateData = { nurse_ids: updatedNurseIds };
          } else if (role === 'patients') {
            const updatedPatientIds = [...(hospitalData.patient_ids || []), newUserId];
            updateData = { patient_ids: updatedPatientIds };
          }

          // Update hospital record
          const { error: hospitalUpdateError } = await supabase
            .from('hospital')
            .update(updateData)
            .eq('id', match.id);

          if (hospitalUpdateError) {
            alert('❌ Error updating hospital: ' + hospitalUpdateError.message);
            setIsLoading(false);
            return;
          }
        }
      }

      if (insertedData && insertedData.length > 0) {
        // Store user data in localStorage
        localStorage.setItem('user_id', insertedData[0].id);
        localStorage.setItem('role', role);
        localStorage.setItem('user_name', insertedData[0].name);

        alert('✅ Registered Successfully!');

        // Navigate to role-specific dashboard
        const dashboardRoute = getDashboardRoute(role);
        router.push(dashboardRoute);
      }

    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-3">Create Your Account</h1>
          <p className="text-gray-400 text-lg">Join our healthcare network today</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            <User className="inline w-5 h-5 mr-2 text-blue-400" />
            I am a:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex items-center justify-center px-6 py-3 rounded-xl border-2 transition-all duration-200
                ${role === 'hospital' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-700 text-blue-300 border-gray-600 hover:border-blue-500 hover:bg-gray-600'}
              `}
            >
              <Hospital className="w-5 h-5 mr-2" /> Hospital
            </button>
            <button
              type="button"
              onClick={() => setRole('nurse')}
              className={`flex items-center justify-center px-6 py-3 rounded-xl border-2 transition-all duration-200
                ${role === 'nurse' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-700 text-blue-300 border-gray-600 hover:border-blue-500 hover:bg-gray-600'}
              `}
            >
              <User className="w-5 h-5 mr-2" /> Nurse
            </button>
            <button
              type="button"
              onClick={() => setRole('patients')}
              className={`flex items-center justify-center px-6 py-3 rounded-xl border-2 transition-all duration-200
                ${role === 'patients' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-700 text-blue-300 border-gray-600 hover:border-blue-500 hover:bg-gray-600'}
              `}
            >
              <Users className="w-5 h-5 mr-2" /> Patient
            </button>
          </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-1 text-gray-400" />
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., John Doe / City General Hospital"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-1 text-gray-400" />
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g., email@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline w-4 h-4 mr-1 text-gray-400" />
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="inline w-4 h-4 mr-1 text-gray-400" />
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g., +1 234 567 8900"
              value={form.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>
        </div>

        {/* Hospital-specific Fields */}
        {role === 'hospital' && (
          <div className="mt-6 border-t pt-6 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Hospital Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />
                Hospital Address
              </label>
              <textarea
                placeholder="Enter full hospital address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Nurse-specific Fields */}
        {role === 'nurse' && (
          <div className="mt-6 border-t pt-6 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nurse Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Home className="inline w-4 h-4 mr-1 text-gray-400" />
                Affiliated Hospital <span className="text-red-400">*</span>
              </label>
              <select
                value={form.hospital_name_input}
                onChange={(e) => handleChange('hospital_name_input', e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white"
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.name}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Patient-specific Fields */}
        {role === 'patients' && (
          <div className="mt-6 border-t pt-6 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Patient Details</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 45"
                    value={form.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="inline w-4 h-4 mr-1 text-gray-400" />
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Home className="inline w-4 h-4 mr-1 text-gray-400" />
                    Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., A201"
                    value={form.room}
                    onChange={(e) => handleChange('room', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Activity className="inline w-4 h-4 mr-1 text-gray-400" />
                    Diagnosis
                  </label>
                  <select
                    value={form.diagnosis}
                    onChange={(e) => handleChange('diagnosis', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white"
                  >
                    {diagnosisOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Hospital className="inline w-4 h-4 mr-1 text-gray-400" />
                  Hospital <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.hospital_name_input}
                  onChange={(e) => handleChange('hospital_name_input', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white"
                  required
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.name}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Language
                </label>
                <select
                  value={form.preferred_lang}
                  onChange={(e) => handleChange('preferred_lang', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-700 text-white"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Camera className="inline w-4 h-4 mr-1 text-gray-400" />
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-800 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                  {imagePreview && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-600 shadow-md flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a profile photo (max 5MB, JPG/PNG).
                </p>
              </div>

              {/* Family Members Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    <Users className="inline w-5 h-5 mr-2 text-gray-400" />
                    Family Members / Emergency Contacts
                  </h3>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                </div>

                {form.family.map((member: any, index: number) => (
                  <div key={index} className="mb-4 p-5 border border-gray-700 rounded-xl bg-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-white">
                        Contact {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="flex items-center px-3 py-1 text-sm text-red-400 border border-red-600 rounded-lg hover:bg-red-900 transition-colors"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-800 text-white placeholder-gray-500"
                      />
                      <select
                        value={member.relationship}
                        onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-800 text-white"
                      >
                        <option value="">Select Relationship</option>
                        {relationshipOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={member.phone_number}
                        onChange={(e) => updateFamilyMember(index, 'phone_number', e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-800 text-white placeholder-gray-500"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={member.email}
                        onChange={(e) => updateFamilyMember(index, 'email', e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-800 text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Address"
                        value={member.address}
                        onChange={(e) => updateFamilyMember(index, 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-800 text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`emergency-${index}`}
                        checked={member.is_emergency_contact}
                        onChange={(e) => updateFamilyMember(index, 'is_emergency_contact', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded-md bg-gray-800"
                      />
                      <label htmlFor={`emergency-${index}`} className="text-sm text-gray-300 font-medium">
                        Emergency Contact
                      </label>
                    </div>
                  </div>
                ))}

                {form.family.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-700 rounded-xl border border-dashed border-gray-600">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="font-medium">No family members added yet.</p>
                    <p className="text-sm">Click "Add Member" to include emergency contacts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full mt-10 py-4 px-6 rounded-xl font-bold text-white text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg
            ${isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Additional Options */}
        <div className="mt-8 text-center">
          <p className="text-base text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}