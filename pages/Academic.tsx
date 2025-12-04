import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, FilePlus, Save, CheckCircle, AlertCircle, Users, CalendarCheck, Calendar, Filter, Lock, Grid, Edit2, ArrowLeft, Award, ChevronRight, ClipboardList, Mail, RefreshCw, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Exam, AttendanceRecord, TimeTable, Mark, LeaveApplication } from '../types';

export const Academic = () => {
  const { students, teachers, attendance, markBatchAttendance, exams, addExam, timeTables, saveTimeTable, marks, saveBatchMarks, leaves, applyLeave, updateLeaveStatus, user, language } = useAuth();
  const location = useLocation();
  const isStudent = user?.role === 'STUDENT';
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isTamil = language === 'ta';

  const [tab, setTab] = useState<'attendance' | 'examschedule' | 'results' | 'timetable' | 'leaves'>('attendance');
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  
  // New Exam Form State
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    name: '',
    date: '',
    class: '',
    subject: '',
    totalMarks: 100
  });

  // New Leave Form State
  const [newLeave, setNewLeave] = useState<Partial<LeaveApplication>>({
      fromDate: '',
      toDate: '',
      reason: ''
  });

  // Filter State
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort((a,b) => Number(a) - Number(b));
  const uniqueSections = [...new Set(students.map(s => s.section))].sort();
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Leave Filter State (Teacher/Admin)
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  // Exam Marks Entry State
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [localMarks, setLocalMarks] = useState<{ [studentId: string]: string }>({}); // Using string for input field

  // Initialize filters once students are loaded
  useEffect(() => {
    if (uniqueClasses.length > 0 && !selectedClass) setSelectedClass(uniqueClasses[0]);
    if (uniqueSections.length > 0 && !selectedSection) setSelectedSection(uniqueSections[0]);
  }, [students]);
  
  // Set student's class/section automatically
  useEffect(() => {
      if (isStudent && user) {
          const myProfile = students.find(s => s.name === user.name);
          if (myProfile) {
              setSelectedClass(myProfile.class);
              setSelectedSection(myProfile.section);
          }
      }
  }, [isStudent, user, students]);

  // Local state for batch attendance marking
  const [localAttendance, setLocalAttendance] = useState<{ [key: string]: AttendanceRecord['status'] }>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // TimeTable Local State
  const [isEditingTimeTable, setIsEditingTimeTable] = useState(false);
  const [activeTimeTable, setActiveTimeTable] = useState<TimeTable | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayDateDisplay = new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (location.pathname.includes('exams')) {
      setTab('examschedule');
    } else if (location.pathname.includes('attendance')) {
      setTab('attendance');
    }
  }, [location.pathname]);

  // Filter Logic
  const filteredStudents = students.filter(s => s.class === selectedClass && s.section === selectedSection);
  
  // Check if attendance is already marked for this section today
  const isAlreadyMarked = filteredStudents.length > 0 && filteredStudents.every(s => 
    attendance.some(a => a.studentId === s.id && a.date === today)
  );

  // Load TimeTable data when tab or filters change
  useEffect(() => {
      if (tab === 'timetable') {
          const found = timeTables.find(t => t.class === selectedClass && t.section === selectedSection);
          if (found) {
              setActiveTimeTable(JSON.parse(JSON.stringify(found))); // Deep copy for editing
          } else {
              // Initialize empty structure
              const emptySchedule = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
                  day,
                  periods: Array(8).fill('')
              }));
              setActiveTimeTable({
                  id: 'temp',
                  class: selectedClass,
                  section: selectedSection,
                  schedule: emptySchedule
              });
          }
          setIsEditingTimeTable(false);
      }
  }, [tab, selectedClass, selectedSection, timeTables]);

  // Load existing attendance into local state when tab opens or filters change
  useEffect(() => {
    if (tab === 'attendance' && !isStudent) {
        const initialMap: { [key: string]: AttendanceRecord['status'] } = {};
        
        filteredStudents.forEach(s => {
            const record = attendance.find(a => a.studentId === s.id && a.date === today);
            if (record) {
                initialMap[s.id] = record.status;
            } else {
                initialMap[s.id] = 'Present'; // Default to Present for easier marking
            }
        });
        setLocalAttendance(initialMap);
    }
  }, [tab, selectedClass, selectedSection, students, attendance, isStudent]);

  // Load existing marks into local state when selectedExam changes
  useEffect(() => {
      if (selectedExam) {
          // Filter students for the exam's class (and current section selection)
          // Note: Exam has a fixed class, but filtering by section helps teacher manage big lists
          const relevantStudents = students.filter(s => s.class === selectedExam.class && s.section === selectedSection);
          
          const initialMarks: { [studentId: string]: string } = {};
          relevantStudents.forEach(s => {
              const mark = marks.find(m => m.examId === selectedExam.id && m.studentId === s.id);
              initialMarks[s.id] = mark ? mark.obtainedMarks.toString() : '';
          });
          setLocalMarks(initialMarks);
      }
  }, [selectedExam, selectedSection, marks, students]);

  // Clear save message
  useEffect(() => {
    if (saveStatus) {
        const timer = setTimeout(() => setSaveStatus(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExam.name && newExam.date && newExam.subject && newExam.class) {
        addExam({
            id: Math.random().toString(36).substr(2, 9),
            name: newExam.name!,
            date: newExam.date!,
            class: newExam.class!,
            subject: newExam.subject!,
            totalMarks: Number(newExam.totalMarks) || 100
        });
        setShowCreateExam(false);
        setNewExam({ name: '', date: '', class: '', subject: '', totalMarks: 100 });
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      let leaveData: Partial<LeaveApplication> = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id, // Using user ID here. For real backend, use real unique ID.
          userName: user.name,
          userRole: user.role,
          fromDate: newLeave.fromDate,
          toDate: newLeave.toDate || newLeave.fromDate,
          reason: newLeave.reason,
          status: 'Pending',
          appliedOn: new Date().toISOString().split('T')[0]
      };

      if (isStudent) {
          const myProfile = students.find(s => s.name === user.name);
          if (myProfile) {
              leaveData.class = myProfile.class;
              leaveData.section = myProfile.section;
              leaveData.userId = myProfile.id; // Correct ID map
          }
      } else if (isTeacher) {
          const myProfile = teachers.find(t => t.name === user.name);
          if (myProfile) {
              leaveData.designation = myProfile.designation;
              leaveData.userId = myProfile.id; // Correct ID map
          }
      }

      if (leaveData.fromDate && leaveData.reason) {
          applyLeave(leaveData as LeaveApplication);
          setShowApplyLeave(false);
          setNewLeave({ fromDate: '', toDate: '', reason: '' });
          setSaveStatus(isTamil ? 'விண்ணப்பம் அனுப்பப்பட்டது' : 'Application Submitted');
      }
  };

  const toggleLocalAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    if (isAlreadyMarked && isTeacher) return; // Prevent editing if marked and user is teacher
    setLocalAttendance(prev => ({
        ...prev,
        [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(localAttendance).map(([studentId, status]) => ({
        studentId,
        status
    }));
    markBatchAttendance(records);
    
    // Count absentees to show in message
    const absentees = records.filter(r => r.status === 'Absent').length;
    const alertMsg = absentees > 0 
        ? (isTamil ? ` & ${absentees} தானியங்கி எச்சரிக்கைகள் அனுப்பப்பட்டன!` : ` & ${absentees} Auto-Alerts sent!`) 
        : '';

    setSaveStatus((isTamil ? 'வருகை பதிவு சேமிக்கப்பட்டது' : 'Attendance saved') + alertMsg);
  };

  const handleSaveTimeTable = () => {
      if (activeTimeTable) {
          saveTimeTable(activeTimeTable);
          setIsEditingTimeTable(false);
          setSaveStatus(isTamil ? 'கால அட்டவணை சேமிக்கப்பட்டது' : 'Time Table Saved Successfully');
      }
  };

  const handleSaveMarks = () => {
      if (!selectedExam) return;

      const newMarksPayload: Mark[] = [];
      
      Object.entries(localMarks).forEach(([studentId, val]) => {
          if (val !== '') {
              const numVal = Number(val);
              // Basic validation
              if (!isNaN(numVal) && numVal >= 0 && numVal <= selectedExam.totalMarks) {
                  newMarksPayload.push({
                      id: Math.random().toString(36).substr(2, 9), // ID will be regenerated but logic filters by student+exam
                      examId: selectedExam.id,
                      studentId: studentId,
                      obtainedMarks: numVal
                  });
              }
          }
      });

      if (newMarksPayload.length > 0) {
          saveBatchMarks(newMarksPayload);
          setSaveStatus(isTamil ? 'மதிப்பெண்கள் சேமிக்கப்பட்டன' : 'Marks Saved Successfully');
          setSelectedExam(null); // Go back to list
      }
  };

  // Helper to find today's attendance for the logged in student
  const getMyAttendanceToday = () => {
    if (!isStudent || !user) return null;
    const myStudentProfile = students.find(s => s.name === user.name);
    if (!myStudentProfile) return null;
    return attendance.find(a => a.studentId === myStudentProfile.id && a.date === today);
  };
  
  const myAttendance = getMyAttendanceToday();

  // Admin Summary Calculation (Global)
  const globalPresentCount = students.filter(s => {
      const record = attendance.find(a => a.studentId === s.id && a.date === today);
      return record?.status === 'Present';
  }).length;

  // Section Summary Calculation
  const sectionPresentCount = filteredStudents.filter(s => localAttendance[s.id] === 'Present' || (isAlreadyMarked && attendance.find(a => a.studentId === s.id && a.date === today)?.status === 'Present')).length;
  const sectionAbsentCount = filteredStudents.filter(s => localAttendance[s.id] === 'Absent' || (isAlreadyMarked && attendance.find(a => a.studentId === s.id && a.date === today)?.status === 'Absent')).length;

  // --- LEAVE FILTERING LOGIC ---
  
  // 1. My Applications (For Students AND Teachers)
  const myLeaves = user 
      ? leaves.filter(l => l.userName === user.name) 
      : [];
  
  // 2. Incoming Requests (Role Based)
  let incomingRequests: LeaveApplication[] = [];

  if (isTeacher) {
      // Teachers see STUDENT requests for their selected class/section
      incomingRequests = leaves.filter(l => 
          l.userRole === 'STUDENT' && 
          l.class === selectedClass && 
          l.section === selectedSection
      );
  } else if (isAdmin) {
      // Admins see TEACHER requests
      // Note: Admin *could* see student requests, but prompt says "Teacher leave view only admin" & "Student leave view only teacher"
      incomingRequests = leaves.filter(l => l.userRole === 'TEACHER');
  }
      
  const filteredIncomingRequests = leaveStatusFilter === 'All' 
      ? incomingRequests 
      : incomingRequests.filter(l => l.status === leaveStatusFilter);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max">
          {(!isStudent || tab === 'attendance') && (
              <button
                onClick={() => setTab('attendance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  tab === 'attendance'
                    ? 'border-tn-500 text-tn-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {isStudent 
                    ? (isTamil ? 'எனது வருகை' : 'My Attendance') 
                    : (isTamil ? 'வருகை மேலாண்மை' : 'Attendance Management')}
              </button>
          )}
          <button
            onClick={() => setTab('leaves')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              tab === 'leaves'
                ? 'border-tn-500 text-tn-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {isTamil ? 'விடுப்பு விண்ணப்பங்கள்' : 'Leave Applications'}
          </button>
          <button
            onClick={() => setTab('timetable')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              tab === 'timetable'
                ? 'border-tn-500 text-tn-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {isTamil ? 'வகுப்பு கால அட்டவணை' : 'Class Time Table'}
          </button>
          <button
            onClick={() => { setTab('examschedule'); setSelectedExam(null); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              tab === 'examschedule'
                ? 'border-tn-500 text-tn-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {isTamil ? 'தேர்வு அட்டவணை' : 'Exam Schedule'}
          </button>
          {!isAdmin && (
            <button
              onClick={() => { setTab('results'); setSelectedExam(null); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'results'
                  ? 'border-tn-500 text-tn-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {isTamil ? 'தேர்வு முடிவுகள்' : 'Results'}
            </button>
          )}
        </nav>
      </div>

      {/* Shared Filters for Teacher/Admin on Attendance and TimeTable tabs */}
      {!isStudent && (tab === 'attendance' || tab === 'timetable' || (tab === 'leaves' && isTeacher)) && (
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{isTamil ? 'வகுப்பு & பிரிவு' : 'Filter Class & Section'}:</span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="border-slate-300 rounded-md text-sm focus:ring-tn-500 focus:border-tn-500"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">{isTamil ? 'வகுப்பு தேர்வு' : 'Select Class'}</option>
                        {uniqueClasses.map(c => <option key={c} value={c}>{isTamil ? 'வகுப்பு' : 'Class'} {c}</option>)}
                    </select>
                    <select 
                        className="border-slate-300 rounded-md text-sm focus:ring-tn-500 focus:border-tn-500"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                    >
                        <option value="">{isTamil ? 'பிரிவு தேர்வு' : 'Select Section'}</option>
                        {uniqueSections.map(s => <option key={s} value={s}>{isTamil ? 'பிரிவு' : 'Section'} {s}</option>)}
                    </select>
                </div>
            </div>
            {tab === 'attendance' && isAlreadyMarked && isTeacher && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200">
                    <Lock className="w-4 h-4 mr-2" />
                    {isTamil ? 'இன்றைய வருகை பதிவு செய்யப்பட்டது' : 'Attendance Submitted for Today'}
                </div>
            )}
        </div>
      )}

      {/* Status Message */}
      {saveStatus && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="text-green-600 w-5 h-5 mr-2" />
            <p className="text-green-700 font-medium">{saveStatus}</p>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {tab === 'attendance' && (
        <div className="space-y-6">
            {isStudent ? (
                /* Student View */
                <div className="max-w-xl mx-auto mt-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-white font-bold text-lg flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-tn-400" />
                                {isTamil ? 'இன்றைய வருகை' : "Today's Attendance"}
                            </h2>
                            <span className="text-slate-300 text-sm bg-slate-800 px-3 py-1 rounded-full">{todayDateDisplay}</span>
                        </div>
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            {myAttendance ? (
                                <>
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                                        myAttendance.status === 'Present' ? 'bg-green-100 text-green-600' : 
                                        myAttendance.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {myAttendance.status === 'Present' ? (
                                            <CheckCircle className="w-16 h-16" />
                                        ) : myAttendance.status === 'Absent' ? (
                                            <X className="w-16 h-16" />
                                        ) : (
                                            <Clock className="w-16 h-16" />
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                        {isTamil ? `நீங்கள் ${myAttendance.status === 'Present' ? 'வருகை புரிந்துள்ளீர்கள்' : 'விடுப்பில் உள்ளீர்கள்'}` : `You are ${myAttendance.status}`}
                                    </h3>
                                    <p className="text-slate-500">
                                        {myAttendance.status === 'Present' 
                                            ? (isTamil ? 'சிறப்பு! தொடர்ந்து வருகை புரியுங்கள்.' : 'Great job! Keep up the good attendance.')
                                            : (isTamil ? 'இது தவறாக இருந்தால் வகுப்பாசிரியரை அணுகவும்.' : 'Please contact your class teacher if this is a mistake.')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-400">
                                        <Clock className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">{isTamil ? 'இன்னும் பதிவு செய்யப்படவில்லை' : 'Not Marked Yet'}</h3>
                                    <p className="text-slate-500">{isTamil ? 'இன்றைய வருகை இன்னும் புதுப்பிக்கப்படவில்லை.' : 'Your attendance has not been updated for today.'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Admin / Teacher View */
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {/* Global Summary (Admin Only) */}
                        {isAdmin && (
                            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">{isTamil ? 'பள்ளி மொத்த வருகை' : 'School Total Present'}</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-2xl font-bold">{globalPresentCount} <span className="text-sm font-normal text-slate-400">/ {students.length}</span></p>
                                    <Users className="w-5 h-5 text-tn-400" />
                                </div>
                            </div>
                        )}
                        
                        {/* Section Summary */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 flex items-center justify-around">
                            <div className="text-center border-r border-slate-100 w-full">
                                <p className="text-xs text-slate-500 uppercase">{isTamil ? 'வகுப்பு' : 'Class'}</p>
                                <p className="text-lg font-bold text-slate-800">{selectedClass} - {selectedSection}</p>
                            </div>
                            <div className="text-center border-r border-slate-100 w-full">
                                <p className="text-xs text-slate-500 uppercase">{isTamil ? 'வருகை' : 'Present'}</p>
                                <p className="text-lg font-bold text-green-600">{sectionPresentCount}</p>
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs text-slate-500 uppercase">{isTamil ? 'விடுப்பு' : 'Absent'}</p>
                                <p className="text-lg font-bold text-red-600">{sectionAbsentCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    {isTamil ? 'வகுப்பு' : 'Class'} {selectedClass} - {selectedSection} 
                                    <span className="text-slate-400">|</span> 
                                    <span className="font-normal text-slate-600">{todayDateDisplay}</span>
                                </h3>
                            </div>
                            {isTeacher && !isAlreadyMarked && (
                                <button 
                                    onClick={handleSaveAttendance}
                                    className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700 transition shadow-sm w-full sm:w-auto justify-center"
                                >
                                    <Save className="w-4 h-4 mr-2" /> {isTamil ? 'வருகையை சேமி' : 'Save Attendance'}
                                </button>
                            )}
                        </div>
                        
                        {filteredStudents.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                {isTamil ? 'இந்த வகுப்பில் மாணவர்கள் இல்லை.' : 'No students found in this class section.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                <thead className="text-slate-500 bg-slate-50 uppercase text-xs">
                                    <tr>
                                    <th className="px-6 py-3">{isTamil ? 'எண்' : 'Roll No'}</th>
                                    <th className="px-6 py-3">{isTamil ? 'பெயர்' : 'Name'}</th>
                                    {isAdmin && <th className="px-6 py-3 text-center">{isTamil ? 'நிலை' : 'Status'}</th>}
                                    {isTeacher && <th className="px-6 py-3 text-center">{isTamil ? 'வருகை பதிவு' : 'Action'}</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student, idx) => {
                                        // Determine status to show
                                        // If already marked DB source, else local state
                                        const dbStatus = attendance.find(a => a.studentId === student.id && a.date === today)?.status;
                                        const displayStatus = isAlreadyMarked ? dbStatus : localAttendance[student.id];

                                        return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-600">100{idx + 1}</td>
                                            <td className="px-6 py-4 font-medium">{student.name}</td>
                                            
                                            {/* Admin View: Always Read Only */}
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        displayStatus === 'Present' ? 'bg-green-100 text-green-700' :
                                                        displayStatus === 'Absent' ? 'bg-red-100 text-red-700' :
                                                        displayStatus === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {displayStatus || (isTamil ? 'நிலுவையில்' : 'Pending')}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Teacher View: Interactive if not marked, Read Only if marked */}
                                            {isTeacher && (
                                                <td className="px-6 py-4">
                                                    {isAlreadyMarked ? (
                                                        <div className="flex justify-center">
                                                            <span className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                                displayStatus === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                                {displayStatus === 'Present' ? <Check size={14} className="mr-1"/> : <X size={14} className="mr-1"/>}
                                                                {displayStatus}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center space-x-2">
                                                            <button 
                                                                onClick={() => toggleLocalAttendance(student.id, 'Present')} 
                                                                className={`flex items-center px-3 py-1.5 rounded-md border transition ${
                                                                    displayStatus === 'Present' 
                                                                    ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-green-400 hover:text-green-600'
                                                                }`}
                                                            >
                                                                <Check size={16} className="mr-1" /> {isTamil ? 'வருகை' : 'Present'}
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleLocalAttendance(student.id, 'Absent')} 
                                                                className={`flex items-center px-3 py-1.5 rounded-md border transition ${
                                                                    displayStatus === 'Absent' 
                                                                    ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-red-400 hover:text-red-600'
                                                                }`}
                                                            >
                                                                <X size={16} className="mr-1" /> {isTamil ? 'விடுப்பு' : 'Absent'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    )})}
                                </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
      )}

      {/* TAB CONTENT: LEAVES */}
      {tab === 'leaves' && (
        <div className="space-y-8">
            {/* SECTION 1: MY APPLICATIONS (Student & Teacher) */}
            {(isStudent || isTeacher) && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{isTamil ? 'எனது விடுப்பு விண்ணப்பங்கள்' : 'My Leave Applications'}</h2>
                            <p className="text-slate-500 text-sm mt-1">{isTamil ? 'உங்கள் கடந்தகால மற்றும் தற்போதைய விடுப்பு கோரிக்கைகள்.' : 'Track your past and current leave requests.'}</p>
                        </div>
                        <button 
                            onClick={() => setShowApplyLeave(true)}
                            className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700 shadow-sm"
                        >
                            <FilePlus className="w-4 h-4 mr-2" /> {isTamil ? 'விண்ணப்பிக்க' : 'Apply for Leave'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">{isTamil ? 'விண்ணப்பித்த தேதி' : 'Applied On'}</th>
                                        <th className="px-6 py-3">{isTamil ? 'தேதிகள்' : 'Dates'}</th>
                                        <th className="px-6 py-3">{isTamil ? 'காரணம்' : 'Reason'}</th>
                                        <th className="px-6 py-3 text-center">{isTamil ? 'நிலை' : 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myLeaves.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">{isTamil ? 'விண்ணப்பங்கள் எதுவும் இல்லை.' : 'No applications found.'}</td></tr>
                                    ) : (
                                        myLeaves.map(leave => (
                                            <tr key={leave.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-slate-600">{leave.appliedOn}</td>
                                                <td className="px-6 py-4 font-medium">
                                                    {leave.fromDate} {leave.toDate !== leave.fromDate && ` - ${leave.toDate}`}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{leave.reason}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                                                        leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {leave.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {leave.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                                        {leave.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                                                        {leave.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: INCOMING REQUESTS (Teacher & Admin) */}
            {(!isStudent) && (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 pt-6 border-t border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">
                            {isTeacher 
                             ? (isTamil ? `மாணவர் விடுப்பு கோரிக்கைகள்` : `Student Leave Requests (${selectedClass}-${selectedSection})`)
                             : (isTamil ? `ஆசிரியர் விடுப்பு கோரிக்கைகள்` : `Teacher Leave Requests`)
                            }
                        </h2>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setLeaveStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                        leaveStatusFilter === status 
                                        ? 'bg-slate-800 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {isTamil 
                                     ? (status === 'Pending' ? 'நிலுவையில்' : status === 'Approved' ? 'ஏற்கப்பட்டது' : status === 'Rejected' ? 'நிராகரிக்கப்பட்டது' : 'அனைத்தும்') 
                                     : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredIncomingRequests.length === 0 ? (
                             <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 italic">
                                {isTamil ? 'விடுப்பு கோரிக்கைகள் இல்லை.' : 'No pending leave requests found.'}
                             </div>
                        ) : (
                            filteredIncomingRequests.map(leave => (
                                <div key={leave.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-800 text-lg">{leave.userName}</h4>
                                            {leave.userRole === 'TEACHER' && (
                                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">{leave.designation}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                            <span className="flex items-center text-tn-600 font-medium">
                                                <Calendar className="w-4 h-4 mr-1" /> 
                                                {leave.fromDate} {leave.toDate !== leave.fromDate && ` ➝ ${leave.toDate}`}
                                            </span>
                                            <span className="text-slate-400">|</span>
                                            <span>{isTamil ? 'விண்ணப்பித்தது' : 'Applied'}: {leave.appliedOn}</span>
                                        </div>
                                        <p className="text-slate-700 bg-slate-50 p-2 rounded-md text-sm border border-slate-100 inline-block min-w-[200px]">
                                            <span className="font-semibold text-slate-500 text-xs uppercase block mb-0.5">{isTamil ? 'காரணம்' : 'Reason'}</span>
                                            {leave.reason}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                        {leave.status === 'Pending' ? (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button 
                                                    onClick={() => updateLeaveStatus(leave.id, 'Rejected')}
                                                    className="flex-1 md:flex-none flex items-center justify-center bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition"
                                                >
                                                    <X className="w-4 h-4 mr-1" /> {isTamil ? 'நிராகரி' : 'Reject'}
                                                </button>
                                                <button 
                                                    onClick={() => updateLeaveStatus(leave.id, 'Approved')}
                                                    className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition"
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> {isTamil ? 'ஏற்றுக்கொள்' : 'Approve'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-lg font-bold flex items-center ${
                                                leave.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {leave.status === 'Approved' ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                                                {leave.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* TAB CONTENT: TIMETABLE */}
      {tab === 'timetable' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center">
                          <Grid className="w-5 h-5 mr-2 text-tn-600" />
                          {isTamil ? `கால அட்டவணை - வகுப்பு ${selectedClass}-${selectedSection}` : `Time Table - Class ${selectedClass}-${selectedSection}`}
                      </h2>
                      {isStudent && <p className="text-sm text-slate-500 mt-1">{isTamil ? 'உங்கள் வகுப்பு அட்டவணை' : 'Your weekly class schedule'}</p>}
                  </div>
                  {isAdmin && (
                      isEditingTimeTable ? (
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => setIsEditingTimeTable(false)}
                                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                              >
                                  {isTamil ? 'ரத்து' : 'Cancel'}
                              </button>
                              <button 
                                  onClick={handleSaveTimeTable}
                                  className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700"
                              >
                                  <Save className="w-4 h-4 mr-2" /> {isTamil ? 'சேமி' : 'Save'}
                              </button>
                          </div>
                      ) : (
                        <button 
                            onClick={() => setIsEditingTimeTable(true)}
                            className="flex items-center text-sm bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                        >
                            <Edit2 className="w-4 h-4 mr-2"/> {isTamil ? 'திருத்து' : 'Edit'}
                        </button>
                      )
                  )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-center border-collapse">
                          <thead>
                              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                  <th className="p-3 text-left w-32 sticky left-0 bg-slate-100 border-r border-slate-200">{isTamil ? 'நாள்' : 'Day'}</th>
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                      <th key={p} className="p-3 border-r border-slate-200 min-w-[100px]">{isTamil ? `வேளை ${p}` : `Period ${p}`}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody>
                              {activeTimeTable?.schedule.map((dayRow, dayIdx) => (
                                  <tr key={dayRow.day} className="border-b border-slate-100 hover:bg-slate-50">
                                      <td className="p-3 text-left font-bold text-slate-800 bg-slate-50 sticky left-0 border-r border-slate-200">
                                          {isTamil ? ({'Monday':'திங்கள்', 'Tuesday':'செவ்வாய்', 'Wednesday':'புதன்', 'Thursday':'வியாழன்', 'Friday':'வெள்ளி'} as any)[dayRow.day] || dayRow.day : dayRow.day}
                                      </td>
                                      {dayRow.periods.map((subject, periodIdx) => (
                                          <td key={periodIdx} className="p-2 border-r border-slate-200">
                                              {isEditingTimeTable ? (
                                                  <input 
                                                      type="text" 
                                                      className="w-full text-center p-1 border border-slate-200 rounded focus:border-tn-500 focus:ring-1 focus:ring-tn-500 text-xs"
                                                      value={subject}
                                                      onChange={(e) => {
                                                          if (!activeTimeTable) return;
                                                          const newSchedule = [...activeTimeTable.schedule];
                                                          newSchedule[dayIdx].periods[periodIdx] = e.target.value;
                                                          setActiveTimeTable({...activeTimeTable, schedule: newSchedule});
                                                      }}
                                                  />
                                              ) : (
                                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium w-full ${
                                                      subject ? 'bg-indigo-50 text-indigo-700' : 'text-slate-300'
                                                  }`}>
                                                      {subject || '-'}
                                                  </span>
                                              )}
                                          </td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* TAB CONTENT: EXAM SCHEDULE */}
      {tab === 'examschedule' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">{isTamil ? 'தேர்வு கால அட்டவணை' : 'Exam Schedule'}</h2>
                {isAdmin && (
                    <button 
                        onClick={() => setShowCreateExam(true)}
                        className="flex items-center text-sm bg-tn-600 text-white px-3 py-2 rounded hover:bg-tn-700"
                    >
                        <FilePlus className="w-4 h-4 mr-2"/> {isTamil ? 'தேர்வை உருவாக்கு' : 'Create Exam'}
                    </button>
                )}
            </div>
            
            <div className="grid gap-4">
                {exams.length === 0 ? (
                     <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 italic">
                        {isTamil ? 'தேர்வுகள் திட்டமிடப்படவில்லை' : 'No exams scheduled yet.'}
                     </div>
                ) : (
                    exams.map(exam => (
                    <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-tn-500" />
                                <h4 className="font-bold text-slate-800 text-lg">{exam.name}</h4>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{exam.subject} • {isTamil ? 'வகுப்பு' : 'Class'} {exam.class}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {exam.date}</span>
                                    <span>{isTamil ? 'மொத்த மதிப்பெண்கள்' : 'Max Marks'}: {exam.totalMarks}</span>
                            </div>
                        </div>
                        <div>
                             <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                                 {isTamil ? 'திட்டமிடப்பட்டது' : 'Scheduled'}
                             </span>
                        </div>
                    </div>
                )))}
            </div>
        </div>
      )}

      {/* TAB CONTENT: RESULTS */}
      {tab === 'results' && !isAdmin && (
        <div className="space-y-6">
            {!selectedExam ? (
                // LIST VIEW FOR RESULTS
                <>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">{isTamil ? 'தேர்வு முடிவுகள்' : 'Exam Results'}</h2>
                    </div>
                    
                    <div className="grid gap-4">
                        {exams.map(exam => {
                             // Student Logic: Find my mark
                             const myMark = isStudent && user ? marks.find(m => m.examId === exam.id && m.studentId === students.find(s=>s.name===user.name)?.id) : null;
                             
                             return (
                            <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-tn-500" />
                                        <h4 className="font-bold text-slate-800 text-lg">{exam.name}</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{exam.subject} • {isTamil ? 'வகுப்பு' : 'Class'} {exam.class}</p>
                                    <div className="text-xs text-slate-400 mt-1">{exam.date}</div>
                                </div>

                                {isStudent ? (
                                    // Student View: Show Marks if available
                                    <div className="text-right w-full sm:w-auto">
                                        {myMark ? (
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                                 <p className="text-xs text-slate-500 uppercase font-semibold">{isTamil ? 'பெற்ற மதிப்பெண்கள்' : 'Marks Obtained'}</p>
                                                 <div className="flex items-baseline justify-center gap-1 mt-1">
                                                     <span className={`text-2xl font-bold ${
                                                         (myMark.obtainedMarks / exam.totalMarks) >= 0.9 ? 'text-green-600' :
                                                         (myMark.obtainedMarks / exam.totalMarks) >= 0.5 ? 'text-blue-600' : 'text-red-600'
                                                     }`}>
                                                         {myMark.obtainedMarks}
                                                     </span>
                                                     <span className="text-slate-400 text-sm">/ {exam.totalMarks}</span>
                                                 </div>
                                                 <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden mx-auto">
                                                     <div 
                                                        className={`h-full rounded-full ${
                                                             (myMark.obtainedMarks / exam.totalMarks) >= 0.9 ? 'bg-green-500' :
                                                             (myMark.obtainedMarks / exam.totalMarks) >= 0.5 ? 'bg-blue-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${(myMark.obtainedMarks / exam.totalMarks) * 100}%` }}
                                                     ></div>
                                                 </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic bg-slate-50 px-3 py-1 rounded">{isTamil ? 'முடிவுகள் நிலுவையில் உள்ளன' : 'Results Pending'}</span>
                                        )}
                                    </div>
                                ) : (
                                    // Teacher/Admin View: Enter Marks Button
                                    <button 
                                        onClick={() => setSelectedExam(exam)}
                                        className="flex items-center text-sm font-medium text-tn-600 bg-tn-50 px-4 py-2 rounded-lg hover:bg-tn-100 transition"
                                    >
                                        {isTamil ? 'மதிப்பெண்களை உள்ளிடவும்' : 'Enter / View Marks'} <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                )}
                            </div>
                        )})}
                        {exams.length === 0 && (
                             <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 italic">
                                {isTamil ? 'தேர்வுகள் எதுவும் இல்லை' : 'No exams found to show results.'}
                             </div>
                        )}
                    </div>
                </>
            ) : (
                // MARKS ENTRY VIEW
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedExam(null)}
                            className="flex items-center text-slate-500 hover:text-slate-700 transition"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" /> {isTamil ? 'திரும்ப' : 'Back to Results'}
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">{selectedExam.name} - {selectedExam.subject} ({isTamil ? 'வகுப்பு' : 'Class'} {selectedExam.class})</h2>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                             <Filter className="w-5 h-5 text-slate-400" />
                             <span className="text-sm font-medium text-slate-700">{isTamil ? 'பிரிவு வடிகட்டி' : 'Filter by Section'}:</span>
                             <select 
                                className="border-slate-300 rounded-md text-sm focus:ring-tn-500 focus:border-tn-500"
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                             >
                                <option value="">{isTamil ? 'பிரிவு தேர்வு' : 'Select Section'}</option>
                                {uniqueSections.map(s => <option key={s} value={s}>{isTamil ? 'பிரிவு' : 'Section'} {s}</option>)}
                             </select>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                             <Award className="w-4 h-4 text-tn-500" />
                             <span className="text-sm text-slate-600">{isTamil ? 'மொத்த மதிப்பெண்கள்' : 'Max Marks'}: <strong>{selectedExam.totalMarks}</strong></span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">{isTamil ? 'மாணவர் பட்டியல்' : 'Student List'} ({filteredStudents.filter(s => s.class === selectedExam.class).length})</h3>
                            <button 
                                onClick={handleSaveMarks}
                                className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700 transition shadow-sm"
                            >
                                <Save className="w-4 h-4 mr-2" /> {isTamil ? 'முடிவுகளை சேமி' : 'Save Results'}
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">{isTamil ? 'எண்' : 'Roll No'}</th>
                                        <th className="px-6 py-3">{isTamil ? 'பெயர்' : 'Name'}</th>
                                        <th className="px-6 py-3">{isTamil ? 'பெற்ற மதிப்பெண்கள்' : 'Marks Obtained'}</th>
                                        <th className="px-6 py-3">{isTamil ? 'விழுக்காடு' : 'Percentage'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.filter(s => s.class === selectedExam.class).map((student, idx) => {
                                        const currentVal = localMarks[student.id] || '';
                                        const percentage = currentVal ? ((Number(currentVal) / selectedExam.totalMarks) * 100).toFixed(0) : '-';
                                        
                                        return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-slate-500">100{idx + 1}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    max={selectedExam.totalMarks}
                                                    className="w-24 border-slate-300 rounded focus:ring-tn-500 focus:border-tn-500"
                                                    placeholder="0"
                                                    value={currentVal}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val <= selectedExam.totalMarks) {
                                                            setLocalMarks({...localMarks, [student.id]: e.target.value});
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${
                                                    percentage === '-' ? 'text-slate-400' :
                                                    Number(percentage) >= 90 ? 'text-green-600' :
                                                    Number(percentage) >= 50 ? 'text-blue-600' : 'text-red-600'
                                                }`}>
                                                    {percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    )})}
                                    {filteredStudents.filter(s => s.class === selectedExam.class).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                                {isTamil ? 'தேர்வு செய்யப்பட்ட வகுப்பில் மாணவர்கள் இல்லை.' : 'No students found in the selected class/section.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{isTamil ? 'புதிய தேர்வு அட்டவணை' : 'Schedule New Exam'}</h3>
                    <button onClick={() => setShowCreateExam(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateExam} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தேர்வு பெயர்' : 'Exam Name'}</label>
                        <input 
                            type="text" 
                            required
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                            placeholder={isTamil ? "எ.கா. அரையாண்டு தேர்வு" : "e.g. Half Yearly Exam"}
                            value={newExam.name}
                            onChange={e => setNewExam({...newExam, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'வகுப்பு' : 'Class'}</label>
                            <select 
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                value={newExam.class}
                                onChange={e => setNewExam({...newExam, class: e.target.value})}
                                required
                            >
                                <option value="">{isTamil ? 'தேர்வு செய்க' : 'Select'}</option>
                                <option value="10">{isTamil ? 'வகுப்பு 10' : 'Class 10'}</option>
                                <option value="11">{isTamil ? 'வகுப்பு 11' : 'Class 11'}</option>
                                <option value="12">{isTamil ? 'வகுப்பு 12' : 'Class 12'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'பாடம்' : 'Subject'}</label>
                            <input 
                                type="text" 
                                required
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                placeholder={isTamil ? "கணிதம்" : "Maths"}
                                value={newExam.subject}
                                onChange={e => setNewExam({...newExam, subject: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தேதி' : 'Date'}</label>
                            <input 
                                type="date" 
                                required
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                value={newExam.date}
                                onChange={e => setNewExam({...newExam, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'மொத்த மதிப்பெண்கள்' : 'Total Marks'}</label>
                            <input 
                                type="number" 
                                required
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                value={newExam.totalMarks}
                                onChange={e => setNewExam({...newExam, totalMarks: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setShowCreateExam(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            {isTamil ? 'ரத்து செய்' : 'Cancel'}
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-tn-600 rounded-lg hover:bg-tn-700 shadow-sm"
                        >
                            {isTamil ? 'அட்டவணை உருவாக்கு' : 'Create Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Apply Leave Modal (Student & Teacher) */}
      {showApplyLeave && (isStudent || isTeacher) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{isTamil ? 'விடுப்பு விண்ணப்பம்' : 'Apply for Leave'}</h3>
                    <button onClick={() => setShowApplyLeave(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தேதியிலிருந்து' : 'From Date'}</label>
                            <input 
                                type="date" 
                                required
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                value={newLeave.fromDate}
                                onChange={e => setNewLeave({...newLeave, fromDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தேதி வரை' : 'To Date'}</label>
                            <input 
                                type="date" 
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                                value={newLeave.toDate}
                                onChange={e => setNewLeave({...newLeave, toDate: e.target.value})}
                                placeholder={isTamil ? 'விருப்பத் தேர்வு' : "Optional"}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'காரணம்' : 'Reason'}</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                            placeholder={isTamil ? "எ.கா. காய்ச்சல், குடும்ப விழா..." : "e.g. Fever, Family Function..."}
                            value={newLeave.reason}
                            onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setShowApplyLeave(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            {isTamil ? 'ரத்து செய்' : 'Cancel'}
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-tn-600 rounded-lg hover:bg-tn-700 shadow-sm"
                        >
                            {isTamil ? 'சமர்ப்பிக்க' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};