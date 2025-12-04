import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Save, X, CheckCircle, ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, Users, Upload, Camera } from 'lucide-react';

export const Students = () => {
  const { students, addStudent, updateStudent, user, language } = useAuth();
  const [view, setView] = useState<'list' | 'add' | 'details' | 'edit'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const canEdit = isAdmin || isTeacher;
  const isTamil = language === 'ta';

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const listHeaderRef = useRef<HTMLHeadingElement>(null);
  const addStudentBtnRef = useRef<HTMLButtonElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Focus management when switching views
  useEffect(() => {
    if (view === 'add' || view === 'edit') {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    } else if (view === 'details') {
      setTimeout(() => backBtnRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        if (addStudentBtnRef.current) {
          addStudentBtnRef.current.focus();
        } else {
          listHeaderRef.current?.focus();
        }
      }, 50);
    }
  }, [view]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      // Fix: Use setTimeout and return its cleanup for correct lifecycle management
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Form State
  const initialFormState: Partial<Student> = {
    gender: 'Male',
    bloodGroup: 'B+',
    community: 'BC',
    religion: 'Hindu',
    name: '',
    dob: '',
    emisNumber: '',
    aadhar: '',
    class: '',
    section: '',
    fatherName: '',
    motherName: '',
    phone: '',
    address: '',
    imageUrl: ''
  };

  const [formData, setFormData] = useState<Partial<Student>>(initialFormState);

  // Fix: Correctly type the event parameter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setView('details');
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData(student);
    setView('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.class) {
      if (view === 'edit' && selectedStudent) {
        updateStudent({
            ...selectedStudent,
            ...formData as Student,
            id: selectedStudent.id // Ensure ID persists
        });
        setStatusMessage(isTamil ? `மாணவர் ${formData.name} விவரங்கள் புதுப்பிக்கப்பட்டது.` : `Student ${formData.name} updated successfully.`);
      } else {
        addStudent({
            ...formData as Student,
            id: Math.random().toString(36).substr(2, 9),
            admissionDate: new Date().toISOString().split('T')[0]
        });
        setStatusMessage(isTamil ? `மாணவர் ${formData.name} சேர்க்கப்பட்டார்.` : `Student ${formData.name} added successfully.`);
      }
      setView('list');
      setFormData(initialFormState);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.emisNumber.includes(searchTerm)
  );

  // Helper for displaying details
  const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-start p-3 bg-slate-50 rounded-lg">
      <div className="mt-1 mr-3 text-tn-600">
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
      {/* Live Region for Status Messages */}
      <div 
        aria-live="polite" 
        className="sr-only" 
        role="status"
      >
        {statusMessage}
      </div>

      {statusMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md flex items-center shadow-sm">
           <CheckCircle className="text-green-600 w-5 h-5 mr-2" />
           <p className="text-green-700 font-medium">{statusMessage}</p>
        </div>
      )}

      {view === 'list' && (
        // Fix: Converted React.createElement calls to standard JSX for better type inference and readability.
        <React.Fragment>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1
                ref={listHeaderRef}
                tabIndex={-1}
                className="text-2xl font-bold text-slate-800 focus:outline-none"
            >
            {isTamil ? 'மாணவர் மேலாண்மை' : 'Student Management'}
            </h1>
            <button
              ref={addStudentBtnRef}
              onClick={() => {
                setFormData(initialFormState);
                setView('add');
              }}
              className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700 transition shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-tn-500"
              aria-label="Add new student"
            >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> {isTamil ? 'மாணவரை சேர்' : 'Add Student'}
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <label htmlFor="search-students" className="sr-only">Search students by Name or EMIS number</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" aria-hidden="true" />
                <input
                  id="search-students"
                  type="text"
                  placeholder={isTamil ? "பெயர் அல்லது EMIS எண் தேட..." : "Search by Name or EMIS..."}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-tn-500 focus:border-tn-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm focus:ring-2 focus:ring-tn-500">
                <Filter className="w-4 h-4 mr-2" aria-hidden="true" /> {isTamil ? 'வடிகட்ட' : 'Filter'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <caption className="sr-only">List of students</caption>
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th scope="col" className="px-6 py-3">{isTamil ? 'EMIS எண்' : 'EMIS No'}</th>
                    <th scope="col" className="px-6 py-3">{isTamil ? 'பெயர்' : 'Name'}</th>
                    <th scope="col" className="px-6 py-3">{isTamil ? 'வகுப்பு' : 'Class'}</th>
                    <th scope="col" className="px-6 py-3">{isTamil ? 'பெற்றோர்' : 'Parent'}</th>
                    <th scope="col" className="px-6 py-3">{isTamil ? 'தொடர்புக்கு' : 'Contact'}</th>
                    <th scope="col" className="px-6 py-3 text-right">{isTamil ? 'செயல்கள்' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{student.emisNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 overflow-hidden" aria-hidden="true">
                            {student.imageUrl ? (
                                <img src={student.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                student.name.charAt(0)
                            )}
                          </div>
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.class} - {student.section}</td>
                      <td className="px-6 py-4">{student.fatherName}</td>
                      <td className="px-6 py-4">{student.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded focus:ring-2 focus:ring-blue-500"
                            aria-label={`View details for ${student.name}`}
                          >
                          <Eye size={16} aria-hidden="true" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded focus:ring-2 focus:ring-amber-500"
                              aria-label={`Edit ${student.name}`}
                            >
                            <Edit size={16} aria-hidden="true" />
                            </button>)}
                          {isAdmin && (
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded focus:ring-2 focus:ring-red-500" aria-label={`Delete ${student.name}`}> <Trash2 size={16} aria-hidden="true" /></button>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    {isTamil ? 'தேடலுக்கு ஏற்ற மாணவர்கள் இல்லை.' : 'No students found matching your search.'}
                </div>
            )}
        </React.Fragment>
      )}

      {(view === 'add' || view === 'edit') && (
        <div className="max-w-4xl mx-auto" role="region" aria-label={view === 'add' ? "Add Student Form" : "Edit Student Form"}>
           <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
                {view === 'add' ? (isTamil ? 'புதிய மாணவர் சேர்க்கை' : 'New Admission Form') : (isTamil ? 'மாணவர் விவரத்தை திருத்து' : 'Edit Student Record')}</h1>
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
                    <span className="w-6 h-6 rounded-full bg-tn-100 text-tn-600 flex items-center justify-center text-xs mr-2" aria-hidden="true">1</span> {isTamil ? 'அடிப்படை தகவல்கள்' : 'Basic Information'}</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:row-span-2 flex flex-col justify-center">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'புகைப்படம்' : 'Student Photo'}</label>
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
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="student-name" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'முழு பெயர்' : 'Full Name'} <span className="text-red-500" aria-hidden="true">*</span></label>
                            <input
                                id="student-name"
                                name="name"
                                ref={nameInputRef}
                                required={true}
                                aria-required="true"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                                type="text"
                                autoComplete="name"
                            /></div>
                        <div>
                            <label htmlFor="student-dob" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பிறந்த தேதி' : 'Date of Birth'}</label>
                            <input
                                id="student-dob"
                                name="dob"
                                value={formData.dob || ''}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                                type="date"
                                autoComplete="bday"
                            /></div>
                        <div>
                            <label htmlFor="student-gender" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பாலினம்' : 'Gender'}</label>
                            <select
                                id="student-gender"
                                name="gender"
                                value={formData.gender || 'Male'}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                                autoComplete="sex"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option></select></div>
                        <div>
                            <label htmlFor="student-blood-group" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'ரத்த வகை' : 'Blood Group'}</label>
                            <select
                                id="student-blood-group"
                                name="bloodGroup"
                                value={formData.bloodGroup || 'B+'}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            >
                                <option>A+</option> <option>B+</option> <option>O+</option> <option>AB+</option></select></div></div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="student-religion" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'மதம்' : 'Religion'}</label>
                            <select
                                id="student-religion"
                                name="religion"
                                value={formData.religion || 'Hindu'}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            >
                                <option>Hindu</option> <option>Muslim</option> <option>Christian</option></select></div>
                        <div>
                            <label htmlFor="student-community" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'சமூகம்' : 'Community'}</label>
                            <select
                                id="student-community"
                                name="community"
                                value={formData.community || 'BC'}
                                onChange={handleInputChange}
                                className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            >
                                <option>BC</option> <option>MBC</option> <option>SC</option> <option>ST</option> <option>OC</option></select></div></div></fieldset>
            <fieldset className="p-6 border-b border-slate-100 bg-slate-50/50">
                <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                    <span className="w-6 h-6 rounded-full bg-tn-100 text-tn-600 flex items-center justify-center text-xs mr-2" aria-hidden="true">2</span> {isTamil ? 'அடையாள விவரங்கள்' : 'Identification'}</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="student-emis" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'EMIS எண்' : 'EMIS Number'} <span className="text-red-500" aria-hidden="true">*</span></label>
                        <input
                            id="student-emis"
                            name="emisNumber"
                            required={true}
                            aria-required="true"
                            value={formData.emisNumber || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="text"
                        /></div>
                    <div>
                        <label htmlFor="student-aadhar" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'ஆதார் எண்' : 'Aadhar Number'}</label>
                        <input
                            id="student-aadhar"
                            name="aadhar"
                            value={formData.aadhar || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="text"
                        /></div>
                    <div>
                        <label htmlFor="student-class" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'வகுப்பு & பிரிவு' : 'Class & Section'} <span className="text-red-500" aria-hidden="true">*</span></label>
                        <div className="flex gap-2">
                             <input
                                id="student-class"
                                name="class"
                                placeholder={isTamil ? "வகுப்பு" : "Class"}
                                aria-label="Class"
                                required={true}
                                aria-required="true"
                                value={formData.class || ''}
                                onChange={handleInputChange}
                                className="w-2/3 border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                                type="text"
                             />
                             <input
                                id="student-section"
                                name="section"
                                placeholder={isTamil ? "பிரிவு" : "Sec"}
                                aria-label="Section"
                                required={true}
                                aria-required="true"
                                value={formData.section || ''}
                                onChange={handleInputChange}
                                className="w-1/3 border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                                type="text"
                             /></div></div></fieldset>
            <fieldset className="p-6 border-b border-slate-100">
                <legend className="text-lg font-semibold text-slate-800 mb-4 flex items-center w-full">
                    <span className="w-6 h-6 rounded-full bg-tn-100 text-tn-600 flex items-center justify-center text-xs mr-2" aria-hidden="true">3</span> {isTamil ? 'பெற்றோர் விவரங்கள்' : 'Parent Details'}</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="student-father" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தந்தை பெயர்' : "Father's Name"}</label>
                        <input
                            id="student-father"
                            name="fatherName"
                            value={formData.fatherName || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="text"
                        /></div>
                    <div>
                        <label htmlFor="student-mother" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தாய் பெயர்' : "Mother's Name"}</label>
                        <input
                            id="student-mother"
                            name="motherName"
                            value={formData.motherName || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="text"
                        /></div>
                    <div>
                        <label htmlFor="student-phone" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}</label>
                        <input
                            id="student-phone"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="tel"
                            autoComplete="tel"
                        /></div>
                    <div>
                        <label htmlFor="student-address" className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'முகவரி' : 'Address'}</label>
                        <input
                            id="student-address"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            className="w-full border-slate-300 rounded-md focus:ring-tn-500 focus:border-tn-500"
                            type="text"
                            autoComplete="street-address"
                        /></div></fieldset>
            <div className="p-6 bg-slate-50 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => {
                      setView('list');
                      setFormData(initialFormState);
                    }}
                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition focus:ring-2 focus:ring-slate-500 focus:outline-none"
                >
                {isTamil ? 'ரத்து செய்' : 'Cancel'}
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-tn-600 text-white rounded-lg hover:bg-tn-700 transition flex items-center shadow-sm focus:ring-2 focus:ring-tn-500 focus:ring-offset-2 focus:outline-none"
                >
                <Save className="w-4 h-4 mr-2" aria-hidden="true" /> {view === 'add' ? (isTamil ? 'சேமி' : 'Save Student Record') : (isTamil ? 'புதுப்பி' : 'Update Student Record')}
                </button></div></form>
        </div>
      )}

      {view === 'details' && selectedStudent && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
           <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <button
                  ref={backBtnRef}
                  onClick={() => setView('list')}
                  className="p-1 hover:bg-slate-100 rounded-full transition focus:ring-2 focus:ring-tn-500 focus:outline-none"
                  aria-label="Back to list"
                >
                <ArrowLeft size={24} />
                </button>
                {isTamil ? 'மாணவர் சுயவிவரம்' : 'Student Profile'}</h1>
              {canEdit && (
                <button
                  onClick={() => handleEditStudent(selectedStudent)}
                  className="flex items-center text-tn-600 hover:text-tn-800 font-medium text-sm"
                >
                <Edit size={16} className="mr-1" /> {isTamil ? 'விவரத்தை திருத்து' : 'Edit Profile'}
                </button>)}</div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-tn-600 to-tn-500 h-32" />
              <div className="px-6 sm:px-8 pb-8">
                  <div className="relative flex flex-col sm:flex-row justify-between items-end -mt-12 mb-6 gap-4">
                      <div className="flex flex-col sm:flex-row items-center sm:items-end">
                          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg z-10 overflow-hidden">
                             {selectedStudent.imageUrl ? (
                                <img src={selectedStudent.imageUrl} alt={selectedStudent.name} className="w-full h-full object-cover rounded-full" />
                             ) : (
                                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500">
                                    {selectedStudent.name.charAt(0)}</div>)}
                          </div>
                          <div className="mt-2 sm:mt-0 sm:ml-4 sm:mb-1 text-center sm:text-left">
                              <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                              <p className="text-slate-600">{isTamil ? 'வகுப்பு' : 'Class'} {selectedStudent.class} - {selectedStudent.section}</p></div></div>
                      <span className="bg-tn-50 text-tn-700 px-3 py-1 rounded-full text-sm font-medium border border-tn-200">
                          EMIS: {selectedStudent.emisNumber}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Details'}</h3>
                          <div className="grid grid-cols-2 gap-4">
                             <DetailRow icon={Calendar} label={isTamil ? 'பிறந்த தேதி' : "Date of Birth"} value={selectedStudent.dob} />
                             <DetailRow icon={User} label={isTamil ? 'பாலினம்' : "Gender"} value={selectedStudent.gender} />
                             <DetailRow icon={User} label={isTamil ? 'ரத்த வகை' : "Blood Group"} value={selectedStudent.bloodGroup} />
                             <DetailRow icon={User} label={isTamil ? 'சமூகம்' : "Community"} value={selectedStudent.community} />
                             <DetailRow icon={User} label={isTamil ? 'மதம்' : "Religion"} value={selectedStudent.religion} />
                             <DetailRow icon={User} label={isTamil ? 'தாய்மொழி' : "Mother Tongue"} value={selectedStudent.motherTongue} /></div></div>
                       <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'தொடர்பு & குடும்பம்' : 'Contact & Family'}</h3>
                          <div className="grid grid-cols-1 gap-4">
                             <DetailRow icon={Phone} label={isTamil ? 'தொலைபேசி' : "Phone Number"} value={selectedStudent.phone} />
                             <DetailRow icon={MapPin} label={isTamil ? 'முகவரி' : "Address"} value={selectedStudent.address} />
                             <DetailRow icon={Users} label={isTamil ? 'தந்தை பெயர்' : "Father's Name"} value={selectedStudent.fatherName} />
                             <DetailRow icon={Users} label={isTamil ? 'தாய் பெயர்' : "Mother's Name"} value={selectedStudent.motherName} /></div></div>
                       <div className="md:col-span-2 space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{isTamil ? 'அடையாளம் & கல்வி' : 'Identification & Academic'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <DetailRow icon={CreditCard} label={isTamil ? 'ஆதார் எண்' : "Aadhar Number"} value={selectedStudent.aadhar} />
                             <DetailRow icon={Calendar} label={isTamil ? 'சேர்ந்த தேதி' : "Admission Date"} value={selectedStudent.admissionDate} /></div></div></div></div>
        </div>
      )}
    </div>
  );
};