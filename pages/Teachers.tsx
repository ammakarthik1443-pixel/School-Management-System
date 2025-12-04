import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, Award, Plus, X, Save, CheckCircle, UploadCloud, ArrowLeft, User, Calendar, Briefcase, CreditCard, Camera } from 'lucide-react';
import { Teacher } from '../types';

export const Teachers = () => {
  const { teachers, addTeacher, user, language } = useAuth();
  const [view, setView] = useState<'list' | 'add' | 'details'>('list');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isAdmin = user?.role === 'ADMIN';
  const isTamil = language === 'ta';

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    gender: 'Female',
    bloodGroup: 'B+',
    status: 'Permanent',
    nationality: 'Indian',
    religion: 'Hindu',
    imageUrl: ''
  });

  // Focus management
  useEffect(() => {
    if (view === 'add') {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    } else if (view === 'details') {
      setTimeout(() => backBtnRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        if (addBtnRef.current) addBtnRef.current.focus();
        else headerRef.current?.focus();
      }, 50);
    }
  }, [view]);

  useEffect(() => {
    if (statusMessage) {
      // Fix: Use setTimeout and return its cleanup for correct lifecycle management
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Fix: Correctly type the event parameter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File too large. Max 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setView('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.employeeId) {
      addTeacher({
        ...formData as Teacher,
        id: Math.random().toString(36).substr(2, 9),
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0]
      });
      setStatusMessage(isTamil ? `ஆசிரியர் ${formData.name} சேர்க்கப்பட்டார்.` : `Staff member ${formData.name} added successfully.`);
      setView('list');
      setFormData({
        gender: 'Female',
        bloodGroup: 'B+',
        status: 'Permanent',
        nationality: 'Indian',
        religion: 'Hindu',
        imageUrl: ''
      });
    }
  };

  // Helper for displaying details
  const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string | number }) => (
    <div className="flex items-start p-3 bg-slate-50 rounded-lg">
      <div className="mt-1 mr-3 text-emerald-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Message */}
      <div aria-live="polite" className="sr-only" role="status">
        {statusMessage}
      </div>
      {statusMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center shadow-sm">
           <CheckCircle className="text-green-600 w-5 h-5 mr-2" />
           <p className="text-green-700 font-medium">{statusMessage}</p>
        </div>
      )}

      {view === 'list' && (
        // Fix: Converted React.createElement calls to standard JSX for better type inference and readability.
        <React.Fragment>
          <div className="flex justify-between items-center">
            <h1 ref={headerRef} tabIndex={-1} className="text-2xl font-bold text-slate-800 focus:outline-none">{isTamil ? 'ஆசிரியர் மேலாண்மை' : 'Staff Management'}</h1>
            {isAdmin && (
              <button
                ref={addBtnRef}
                onClick={() => setView('add')}
                className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
              <Plus className="w-4 h-4 mr-2" /> {isTamil ? 'ஆசிரியரை சேர்' : 'Add Staff'}
              </button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                <div className="h-24 bg-slate-900 relative">
                  <div className="absolute -bottom-8 left-6">
                      <div className="w-16 h-16 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700 overflow-hidden">
                        {teacher.imageUrl ? (
                            <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                            teacher.name.charAt(0)
                        )}
                      </div></div>
                </div>
                <div className="pt-10 px-6 pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                            <p className="text-sm text-emerald-600 font-medium">{teacher.designation}</p></div>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">ID: {teacher.employeeId}</span></div>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                            <Award className="w-4 h-4 mr-2 text-slate-400" />
                            {teacher.qualification} • {teacher.subject}</div>
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            {teacher.phone}</div>
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            {teacher.email}</div></div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-500">{isTamil ? 'சேர்ந்தது' : 'Joined'}: {teacher.joiningDate}</span>
                        <button
                          onClick={() => handleViewTeacher(teacher)}
                          className="text-sm text-emerald-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
                        >
                        {isTamil ? 'விவரம் பார்' : 'View Profile'}
                        </button></div></div>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}

      {view === 'add' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">{isTamil ? 'புதிய ஆசிரியர் பதிவு' : 'New Staff Registration'}</h1>
            <button
                onClick={() => setView('list')}
                className="text-slate-500 hover:text-slate-700 focus:ring-2 focus:ring-slate-500 rounded-full p-1 focus:outline-none"
                aria-label="Close form"
            >
            <X size={24} aria-hidden="true" />
            </button></div>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <fieldset className="p-6 border-b border-slate-100">
              <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">1</span> {isTamil ? 'தனிப்பட்ட தகவல்கள்' : 'Personal Information'}</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:row-span-2 flex flex-col justify-center">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'புகைப்படம்' : 'Staff Photo'}</label>
                    <div
                        className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer h-40"
                        onClick={() => photoInputRef.current?.click()}
                        role="button"
                        aria-label="Upload Photo"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
                    >
                            {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Preview" className="h-full object-contain rounded" />
                            ) : (
                            <div className="text-slate-400">
                                <Camera className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-xs block">{isTamil ? 'கிளிக் செய்து பதிவேற்றவும்' : 'Click to Upload'}</span>
                                <span className="text-[10px] text-slate-400 block mt-1">(Max 2MB)</span></div>)}
                    </div>
                    <input
                        type="file"
                        ref={photoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    /></div>
                <div className="md:col-span-2">
                  <label htmlFor="t-name" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'முழு பெயர்' : 'Full Name'} <span className="text-red-500">*</span></label>
                  <input id="t-name" name="name" ref={nameInputRef} required={true} onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" /></div>
                <div>
                  <label htmlFor="t-gender" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பாலினம்' : 'Gender'} <span className="text-red-500">*</span></label>
                  <select id="t-gender" name="gender" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option></select></div>
                <div>
                  <label htmlFor="t-dob" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பிறந்த தேதி' : 'Date of Birth'}</label>
                  <input id="t-dob" name="dob" type="date" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" /></div>
                <div>
                  <label htmlFor="t-religion" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'மதம்' : 'Religion'}</label>
                  <select id="t-religion" name="religion" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Hindu</option> <option>Muslim</option> <option>Christian</option> <option>Other</option></select></div>
                <div>
                  <label htmlFor="t-blood" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'ரத்த வகை' : 'Blood Group'}</label>
                  <select id="t-blood" name="bloodGroup" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option>A+</option> <option>B+</option> <option>AB+</option> <option>O+</option> <option>O-</option></select></div>
                <div>
                  <label htmlFor="t-marital" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'திருமண நிலை' : 'Marital Status'}</label>
                  <select id="t-marital" name="maritalStatus" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option>Single</option> <option>Married</option> <option>Widowed</option> <option>Divorced</option></select></div>
                <div className="md:col-span-2">
                   <label htmlFor="t-address" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'முகவரி' : 'Residential Address'}</label>
                   <input id="t-address" name="address" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" placeholder={isTamil ? "வீட்டு எண், தெரு, ஊர்..." : "House No, Street, Area, City, Pincode"} /></div>
                 <div>
                   <label htmlFor="t-aadhar" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'ஆதார் எண்' : 'Aadhar Number'}</label>
                   <input id="t-aadhar" name="aadharNumber" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" maxLength={12} /></div></div></fieldset>
            <fieldset className="p-6 border-b border-slate-100 bg-slate-50/50">
              <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">2</span> {isTamil ? 'கல்வி & வேலைவாய்ப்பு' : 'Education & Employment'}</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="t-empid" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பணியாளர் எண்' : 'Employee ID'} <span className="text-red-500">*</span></label>
                  <input id="t-empid" name="employeeId" required={true} onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" /></div>
                <div>
                  <label htmlFor="t-designation" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பதவி' : 'Designation'} <span className="text-red-500">*</span></label>
                  <input id="t-designation" name="designation" required={true} onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" placeholder={isTamil ? "எ.கா. முதுகலை ஆசிரியர்" : "e.g. PG Assistant"} /></div>
                <div>
                  <label htmlFor="t-subject" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பாடம்' : 'Subject Expertise'} <span className="text-red-500">*</span></label>
                  <input id="t-subject" name="subject" required={true} onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" /></div>
                <div>
                  <label htmlFor="t-qualification" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தகுதி' : 'Qualification'}</label>
                  <input id="t-qualification" name="qualification" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" placeholder="e.g. M.Sc, B.Ed" /></div>
                <div>
                  <label htmlFor="t-exp" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'அனுபவம் (ஆண்டுகள்)' : 'Experience (Years)'}</label>
                  <input id="t-exp" name="experienceYears" type="number" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" /></div>
                <div>
                  <label htmlFor="t-joining" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'சேர்ந்த தேதி' : 'Date of Joining'}</label>
                  <input id="t-joining" name="joiningDate" type="date" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" /></div>
                 <div>
                  <label htmlFor="t-status" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பணி நிலை' : 'Employment Status'}</label>
                  <select id="t-status" name="status" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Contract">Contract</option></select></div></fieldset>
            <fieldset className="p-6 border-b border-slate-100">
               <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">3</span> {isTamil ? 'வங்கி & தொடர்பு' : 'Banking & Contact'}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="t-phone" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தொலைபேசி எண்' : 'Phone Number'} <span className="text-red-500">*</span></label>
                  <input id="t-phone" name="phone" required={true} onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="tel" /></div>
                <div>
                  <label htmlFor="t-email" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'மின்னஞ்சல்' : 'Email ID'}</label>
                  <input id="t-email" name="email" type="email" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" /></div>
                <div>
                   <label htmlFor="t-bank" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'வங்கி கணக்கு எண்' : 'Bank Account Number'}</label>
                   <input id="t-bank" name="bankAccount" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" /></div>
                <div>
                   <label htmlFor="t-ifsc" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'வங்கி IFSC குறியீடு' : 'Bank IFSC Code'}</label>
                   <input id="t-ifsc" name="ifscCode" onChange={handleInputChange} className="w-full border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" type="text" /></div></div></fieldset>
            <fieldset className="p-6 bg-slate-50/50">
               <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">4</span> {isTamil ? 'ஆவணங்கள் பதிவேற்றம்' : 'Documents Upload'}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                      isTamil ? 'ஆதார் அட்டை' : 'Aadhar Card',
                      isTamil ? 'கல்வி சான்றிதழ்கள்' : 'Educational Certs',
                      isTamil ? 'புகைப்படம்' : 'Photo',
                      isTamil ? 'கையொப்பம்' : 'Signature'
                    ].map((doc) => (
                      <div key={doc} className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer">
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm font-medium text-slate-600">{doc}</span>
                          <span className="text-xs text-slate-400 mt-1">{isTamil ? 'பதிவேற்ற கிளிக் செய்யவும்' : 'Click to upload'}</span></div>))}</div></fieldset>
            <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
                <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition focus:ring-2 focus:ring-slate-500 focus:outline-none"
                >
                {isTamil ? 'ரத்து செய்' : 'Cancel'}
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
                >
                <Save className="w-4 h-4 mr-2" /> {isTamil ? 'சேமி' : 'Save Staff Record'}
                </button></div></form>
        </div>
      )}

      {view === 'details' && selectedTeacher && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
           <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <button
                  ref={backBtnRef}
                  onClick={() => setView('list')}
                  className="p-1 hover:bg-slate-100 rounded-full transition focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  aria-label="Back to list"
                >
                <ArrowLeft size={24} />
                </button>
                {isTamil ? 'ஆசிரியர் விவரம்' : 'Staff Profile'}</h1>
              {isAdmin && (
                <button className="flex items-center text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                  <UploadCloud size={16} className="mr-1" /> {isTamil ? 'ஆவணங்களை புதுப்பி' : 'Update Docs'}</button>)}</div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 h-32" />
              <div className="px-6 sm:px-8 pb-8">
                  <div className="relative flex flex-col sm:flex-row justify-between items-end -mt-12 mb-6 gap-4">
                      <div className="flex flex-col sm:flex-row items-center sm:items-end">
                          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg z-10 overflow-hidden">
                            {selectedTeacher.imageUrl ? (
                                <img src={selectedTeacher.imageUrl} alt="" className="w-full h-full object-cover rounded-full border-2 border-emerald-50" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-2 border-emerald-50">
                                    {selectedTeacher.name.charAt(0)}</div>)}
                            </div>
                          <div className="mt-2 sm:mt-0 sm:ml-4 sm:mb-1 text-center sm:text-left">
                              <h2 className="text-2xl font-bold text-slate-900">{selectedTeacher.name}</h2>
                              <p className="text-emerald-600 font-medium">{selectedTeacher.designation}</p></div></div>
                      <div className="flex flex-col items-end">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200 mb-1">
                            ID: {selectedTeacher.employeeId}</span>
                        <span className="text-xs text-slate-500">{isTamil ? 'சேர்ந்தது' : 'Joined'}: {selectedTeacher.joiningDate}</span></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'தொழில்முறை தகவல்' : 'Professional Info'}</h3>
                          <div className="grid grid-cols-1 gap-4">
                             <DetailRow icon={Briefcase} label={isTamil ? 'பாடம்' : "Subject"} value={selectedTeacher.subject} />
                             <DetailRow icon={Award} label={isTamil ? 'தகுதி' : "Qualification"} value={selectedTeacher.qualification} />
                             <DetailRow icon={Briefcase} label={isTamil ? 'அனுபவம்' : "Experience"} value={`${selectedTeacher.experienceYears} ${isTamil ? 'ஆண்டுகள்' : 'Years'}`} />
                             <DetailRow icon={User} label={isTamil ? 'பணி நிலை' : "Employment Status"} value={selectedTeacher.status} /></div></div>
                       <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'தொடர்பு தகவல்' : 'Contact Info'}</h3>
                          <div className="grid grid-cols-1 gap-4">
                             <DetailRow icon={Phone} label={isTamil ? 'தொலைபேசி' : "Phone Number"} value={selectedTeacher.phone} />
                             <DetailRow icon={Mail} label={isTamil ? 'மின்னஞ்சல்' : "Email Address"} value={selectedTeacher.email} />
                             <DetailRow icon={MapPin} label={isTamil ? 'முகவரி' : "Address"} value={selectedTeacher.address} /></div></div>
                       <div className="md:col-span-2 space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'தனிப்பட்ட & வங்கி' : 'Personal & Banking'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <DetailRow icon={Calendar} label={isTamil ? 'பிறந்த தேதி' : "Date of Birth"} value={selectedTeacher.dob} />
                             <DetailRow icon={User} label={isTamil ? 'பாலினம்' : "Gender"} value={selectedTeacher.gender} />
                             <DetailRow icon={User} label={isTamil ? 'ரத்த வகை' : "Blood Group"} value={selectedTeacher.bloodGroup} />
                             <DetailRow icon={CreditCard} label={isTamil ? 'வங்கி கணக்கு' : "Bank Account"} value={selectedTeacher.bankAccount} />
                             <DetailRow icon={CreditCard} label={isTamil ? 'IFSC குறியீடு' : "IFSC Code"} value={selectedTeacher.ifscCode} />
                             <DetailRow icon={CreditCard} label={isTamil ? 'ஆதார் எண்' : "Aadhar Number"} value={selectedTeacher.aadharNumber} /></div></div></div></div>
        </div>
      )}
    </div>
  );
};