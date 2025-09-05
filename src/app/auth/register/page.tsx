"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, User, Mail, Lock, Phone, MapPin, Calendar, Activity, Home, Camera, Users, Plus, Minus, Hospital, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

const roleDetails = {
  hospital: { title: "Hospital", icon: Hospital, description: "Register as a hospital administrator." },
  nurse: { title: "Nurse", icon: User, description: "Register as a healthcare professional." },
  patients: { title: "Patient", icon: Users, description: "Register a new patient profile." },
};

const RoleCard = ({ role, currentRole, setRole, Icon }) => (
  <button
    type="button"
    onClick={() => setRole(role)}
    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer
      ${currentRole === role
        ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-md'
        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
      }
    `}
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-full ${currentRole === role ? 'bg-blue-200' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${currentRole === role ? 'text-blue-600' : 'text-gray-500'}`} />
      </div>
      <span className={`font-semibold ml-3 ${currentRole === role ? 'text-blue-800' : 'text-gray-700'}`}>{roleDetails[role].title}</span>
    </div>
    <ChevronRight className={`w-5 h-5 transition-transform ${currentRole === role ? 'text-blue-600' : 'text-gray-400'}`} />
  </button>
);

const FormInput = ({ label, type, placeholder, value, onChange, Icon, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      <Icon className="w-4 h-4 mr-2 text-gray-400" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-800 placeholder-gray-400"
      required={required}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, Icon, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
      <Icon className="w-4 h-4 mr-2 text-gray-400" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-800"
      required={required}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

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
    { value: '', label: 'Select Relationship' },
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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setForm({ ...form, photo_file: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      } else if (role === 'nurse') {
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
      } else if (role === 'patients') {
        const match = hospitals.find(
          (h: any) => h.name.toLowerCase() === form.hospital_name_input.toLowerCase()
        );

        if (!match) {
          alert('❌ Hospital name not found!');
          setIsLoading(false);
          return;
        }

        let photo_url = form.photo_url;
        if (form.photo_file) {
          const fileExt = form.photo_file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `patient_photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('patient-photos')
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

      const table = role === 'hospital' ? 'hospital' : role === 'nurse' ? 'nurse' : 'patients';

      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([payload])
        .select();

      if (error) {
        alert('❌ Error: ' + error.message);
        setIsLoading(false);
        return;
      }

      if (role === 'nurse' || role === 'patients') {
        const match = hospitals.find(
          (h: any) => h.name.toLowerCase() === form.hospital_name_input.toLowerCase()
        );

        if (match && insertedData && insertedData.length > 0) {
          const newUserId = insertedData[0].id;

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

          let updateData = {};
          if (role === 'nurse') {
            const updatedNurseIds = [...(hospitalData.nurse_ids || []), newUserId];
            updateData = { nurse_ids: updatedNurseIds };
          } else if (role === 'patients') {
            const updatedPatientIds = [...(hospitalData.patient_ids || []), newUserId];
            updateData = { patient_ids: updatedPatientIds };
          }

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
        localStorage.setItem('user_id', insertedData[0].id);
        localStorage.setItem('role', role);
        localStorage.setItem('user_name', insertedData[0].name);
        alert('✅ Registered Successfully!');
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

  const renderFormFields = () => {
    switch (role) {
      case 'hospital':
        return (
          <div className="space-y-6">
            <FormInput
              label="Hospital Address"
              type="text"
              placeholder="Enter full hospital address"
              value={form.address}
              onChange={(value) => handleChange('address', value)}
              Icon={MapPin}
            />
          </div>
        );
      case 'nurse':
        return (
          <div className="space-y-6">
            <FormSelect
              label="Affiliated Hospital"
              value={form.hospital_name_input}
              onChange={(value) => handleChange('hospital_name_input', value)}
              options={[{ value: '', label: 'Select Hospital' }, ...hospitals.map(h => ({ value: h.name, label: h.name }))]}
              Icon={Hospital}
              required
            />
          </div>
        );
      case 'patients':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormInput
                label="Age"
                type="number"
                placeholder="e.g., 45"
                value={form.age}
                onChange={(value) => handleChange('age', value)}
                Icon={Calendar}
              />
              <FormSelect
                label="Gender"
                value={form.gender}
                onChange={(value) => handleChange('gender', value)}
                options={genderOptions}
                Icon={User}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormInput
                label="Room Number"
                type="text"
                placeholder="e.g., A201"
                value={form.room}
                onChange={(value) => handleChange('room', value)}
                Icon={Home}
              />
              <FormSelect
                label="Diagnosis"
                value={form.diagnosis}
                onChange={(value) => handleChange('diagnosis', value)}
                options={diagnosisOptions}
                Icon={Activity}
              />
            </div>
            <FormSelect
              label="Hospital"
              value={form.hospital_name_input}
              onChange={(value) => handleChange('hospital_name_input', value)}
              options={[{ value: '', label: 'Select Hospital' }, ...hospitals.map(h => ({ value: h.name, label: h.name }))]}
              Icon={Hospital}
              required
            />
            <FormSelect
              label="Preferred Language"
              value={form.preferred_lang}
              onChange={(value) => handleChange('preferred_lang', value)}
              options={languageOptions}
              Icon={MapPin}
            />

            {/* Photo Upload */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-gray-500" />Profile Photo
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-600 shadow-md flex-shrink-0">
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a profile photo (max 5MB, JPG/PNG).
              </p>
            </div>

            {/* Family Members Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />Family/Emergency Contacts
                </h3>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Member
                </button>
              </div>
              <div className="space-y-4">
                {form.family.length > 0 ? (
                  form.family.map((member: any, index: number) => (
                    <div key={index} className="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-700">Contact {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(index)}
                          className="flex items-center px-3 py-1 text-xs text-red-500 border border-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Minus className="w-3 h-3 mr-1" /> Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
                        />
                        <select
                          value={member.relationship}
                          onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                        >
                          {relationshipOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={member.phone_number}
                          onChange={(e) => updateFamilyMember(index, 'phone_number', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={member.email}
                          onChange={(e) => updateFamilyMember(index, 'email', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Address"
                        value={member.address}
                        onChange={(e) => updateFamilyMember(index, 'address', e.target.value)}
                        className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
                      />
                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          id={`emergency-${index}`}
                          checked={member.is_emergency_contact}
                          onChange={(e) => updateFamilyMember(index, 'is_emergency_contact', e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white"
                        />
                        <label htmlFor={`emergency-${index}`} className="text-sm text-gray-600 font-medium">
                          Emergency Contact
                        </label>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No family members added yet.</p>
                    <p className="text-sm">Click "Add Member" to include emergency contacts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full p-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Create Your Account</h1>
          <p className="text-gray-500 text-lg">Join our healthcare network today</p>
        </div>

        {/* Role Selection */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(roleDetails).map(([key, details]) => (
              <RoleCard
                key={key}
                role={key}
                currentRole={role}
                setRole={setRole}
                Icon={details.icon}
              />
            ))}
          </div>
        </div>
        
        {/* Registration Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">General Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Full Name"
              type="text"
              placeholder="e.g., John Doe"
              value={form.name}
              onChange={(value) => handleChange('name', value)}
              Icon={User}
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              placeholder="e.g., email@example.com"
              value={form.email}
              onChange={(value) => handleChange('email', value)}
              Icon={Mail}
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(value) => handleChange('password', value)}
              Icon={Lock}
              required
            />
            <FormInput
              label="Phone Number"
              type="tel"
              placeholder="e.g., +1 234 567 8900"
              value={form.phone_number}
              onChange={(value) => handleChange('phone_number', value)}
              Icon={Phone}
              required
            />
          </div>
        </div>
        
        {/* Role-specific Fields */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{roleDetails[role].title} Details</h2>
          <div className="p-8 bg-gray-50 rounded-2xl shadow-inner">
            {renderFormFields()}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full mt-10 py-4 px-6 rounded-2xl font-bold text-white text-lg tracking-wide transition-all duration-300 transform hover:scale-[1.01] shadow-xl
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
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
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}