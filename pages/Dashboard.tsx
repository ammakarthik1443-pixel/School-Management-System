import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, GraduationCap, ClipboardList, 
  TrendingUp, Calendar, AlertCircle, Plus, Trash2, X, Bell, MessageSquare, Mic, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Notice } from '../types';

export const Dashboard = () => {
  const { user, students, teachers, documents, notices, communicationLogs, attendance, marks, exams, addNotice, deleteNotice, language } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const canEditNotices = isAdmin || isTeacher;
  const isTamil = language === 'ta';

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: '',
    message: '',
    type: 'info'
  });

  // --- CALCULATIONS ---

  // 1. Total Students
  const totalStudents = students.length;
  
  // 2. Attendance (Today)
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
  // If no attendance marked today yet, these will be 0.
  
  // 3. Exam Results (Pass/Fail)
  // Threshold: 35 marks out of 100 (Standard)
  const PASS_MARK = 35; 
  
  let passCount = 0;
  let failCount = 0;
  
  marks.forEach(mark => {
      // Find the exam to get total marks if needed, usually we assume % or raw marks. 
      // Assuming 'obtainedMarks' is out of 100 for simplicity or using the Exam definition.
      const exam = exams.find(e => e.id === mark.examId);
      const total = exam ? exam.totalMarks : 100;
      const percentage = (mark.obtainedMarks / total) * 100;
      
      if (percentage >= PASS_MARK) {
          passCount++;
      } else {
          failCount++;
      }
  });

  const totalMarksRecorded = passCount + failCount;
  const passPercentage = totalMarksRecorded > 0 ? ((passCount / totalMarksRecorded) * 100).toFixed(1) : '0';
  const failPercentage = totalMarksRecorded > 0 ? ((failCount / totalMarksRecorded) * 100).toFixed(1) : '0';

  // --- CHART DATA ---

  const attendanceData = [
    { name: isTamil ? 'திங்கள்' : 'Mon', present: 90 },
    { name: isTamil ? 'செவ்வாய்' : 'Tue', present: 85 },
    { name: isTamil ? 'புதன்' : 'Wed', present: 88 },
    { name: isTamil ? 'வியாழன்' : 'Thu', present: 92 },
    { name: isTamil ? 'வெள்ளி' : 'Fri', present: 87 },
  ];

  const examPerformanceData = [
    { name: isTamil ? 'தேர்ச்சி' : 'Passed', value: passCount },
    { name: isTamil ? 'தோல்வி' : 'Failed', value: failCount },
  ];

  const genderData = [
    { name: isTamil ? 'மாணவர்கள்' : 'Boys', value: students.filter(s => s.gender === 'Male').length },
    { name: isTamil ? 'மாணவிகள்' : 'Girls', value: students.filter(s => s.gender === 'Female').length },
  ];

  const COLORS = ['#0ea5e9', '#ec4899'];
  const EXAM_COLORS = ['#10b981', '#ef4444']; // Green for Pass, Red for Fail

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-1 flex items-center">{trend}</p>}
      </div>
      <div className={`p-4 rounded-full bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  );

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNotice.title && newNotice.message) {
      addNotice({
        id: Math.random().toString(36).substr(2, 9),
        title: newNotice.title,
        message: newNotice.message,
        date: new Date().toISOString().split('T')[0],
        type: newNotice.type || 'info',
        postedBy: user?.name || 'Staff'
      } as Notice);
      setShowNoticeModal(false);
      setNewNotice({ title: '', message: '', type: 'info' });
    }
  };

  const getNoticeColor = (type: string) => {
    switch (type) {
        case 'warning': return 'orange';
        case 'urgent': return 'red';
        case 'success': return 'green';
        default: return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isTamil ? 'நல்வரவு' : 'Welcome back'}, {user?.name}</h1>
          <p className="text-slate-500 text-sm">{isTamil ? 'இன்று உங்கள் பள்ளியின் செயல்பாடுகள்.' : "Here is what's happening in your school today."}</p>
        </div>
        <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm font-medium text-slate-700">
            {new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
            /* Admin Specific Stats */
            <>
                <StatCard 
                    title={isTamil ? 'மொத்த மாணவர்கள்' : "Total Students"} 
                    value={totalStudents} 
                    icon={Users} 
                    color="blue" 
                />
                <StatCard 
                    title={isTamil ? 'இன்று வருகை' : "Present Today"} 
                    value={presentToday} 
                    icon={CheckCircle} 
                    color="emerald" 
                    trend={isTamil ? 'வருகை புரிந்தோர்' : 'Students Present'}
                />
                <StatCard 
                    title={isTamil ? 'இன்று விடுப்பு' : "Absent Today"} 
                    value={absentToday} 
                    icon={XCircle} 
                    color="red" 
                    trend={isTamil ? 'வருகை புரியாதோர்' : 'Students Absent'}
                />
                <StatCard 
                    title={isTamil ? 'தேர்ச்சி சதவீதம்' : "Pass Percentage"} 
                    value={`${passPercentage}%`} 
                    icon={GraduationCap} 
                    color="indigo" 
                    trend={`${failPercentage}% ${isTamil ? 'தோல்வி' : 'Fail'}`}
                />
            </>
        ) : (
            /* Teacher / Student Stats */
            <>
                <StatCard title={isTamil ? 'மொத்த மாணவர்கள்' : "Total Students"} value={totalStudents} icon={GraduationCap} color="blue" trend={isTamil ? "+12 இந்த மாதம்" : "+12 this month"} />
                <StatCard title={isTamil ? 'சராசரி வருகை' : "Avg. Attendance"} value={`87%`} icon={ClipboardList} color="indigo" trend="+2.4%" />
                <StatCard title={isTamil ? 'ஆவணங்கள்' : "Documents"} value={documents.length} icon={AlertCircle} color="amber" />
                <StatCard title={isTamil ? 'அறிவிப்புகள்' : "Notices"} value={notices.length} icon={Bell} color="purple" />
            </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass/Fail Ratio Chart (Admin) or Attendance Chart (Others) */}
        {isAdmin ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{isTamil ? 'தேர்வு முடிவுகள் பகுப்பாய்வு' : 'Exam Performance'}</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={examPerformanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {examPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EXAM_COLORS[index % EXAM_COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2 text-sm">
                    <div className="text-center">
                        <p className="text-slate-500">{isTamil ? 'தேர்ச்சி' : 'Passed'}</p>
                        <p className="font-bold text-emerald-600 text-lg">{passCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500">{isTamil ? 'தோல்வி' : 'Failed'}</p>
                        <p className="font-bold text-red-600 text-lg">{failCount}</p>
                    </div>
                </div>
            </div>
        ) : (
             <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{isTamil ? 'வருகை கண்ணோட்டம்' : 'Attendance Overview'}</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="present" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* Gender Distribution or Attendance (if Admin takes slot 1) */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 ${isAdmin ? 'lg:col-span-2' : ''}`}>
           <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                    {isAdmin ? (isTamil ? 'வாராந்திர வருகை போக்கு' : 'Weekly Attendance Trend') : (isTamil ? 'மாணவர் விகிதம்' : 'Student Ratio')}
                </h3>
           </div>
           
           <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {isAdmin ? (
                  <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
              ) : (
                <PieChart>
                    <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notice Board */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-tn-600" /> {isTamil ? 'அறிவிப்பு பலகை' : 'Notice Board'}
                </h3>
                {canEditNotices && (
                    <button 
                        onClick={() => setShowNoticeModal(true)}
                        className="text-sm bg-tn-50 text-tn-700 px-3 py-1.5 rounded-full hover:bg-tn-100 flex items-center transition"
                    >
                        <Plus className="w-3 h-3 mr-1" /> {isTamil ? 'அறிவிப்பை சேர்' : 'Add Notice'}
                    </button>
                )}
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {notices.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic">{isTamil ? 'தற்போது அறிவிப்புகள் ஏதுமில்லை.' : 'No notices at the moment.'}</div>
                ) : (
                    notices.map((notice) => {
                        const color = getNoticeColor(notice.type);
                        return (
                            <div key={notice.id} className={`flex items-start p-4 bg-${color}-50 rounded-lg border-l-4 border-${color}-500 relative group`}>
                                <div className="ml-2 flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm font-semibold text-${color}-900`}>{notice.title}</p>
                                        <span className={`text-[10px] uppercase font-bold text-${color}-600 bg-white px-1.5 py-0.5 rounded shadow-sm opacity-70`}>{notice.type}</span>
                                    </div>
                                    <p className={`text-xs text-${color}-700 mt-1`}>{notice.message}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">{notice.date} • {notice.postedBy}</span>
                                    </div>
                                </div>
                                {canEditNotices && (
                                    <button 
                                        onClick={() => deleteNotice(notice.id)}
                                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Notice"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
          </div>

          {/* Automated Alerts Log */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" /> 
                {isTamil ? 'தானியங்கி எச்சரிக்கைகள்' : 'Recent Automated Alerts'}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {communicationLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic">
                        {isTamil ? 'எச்சரிக்கைகள் எதுவும் அனுப்பப்படவில்லை.' : 'No automated alerts sent recently.'}
                    </div>
                ) : (
                    communicationLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                             <div className="flex items-center gap-3 overflow-hidden">
                                 <div className={`p-2 rounded-full ${log.type === 'SMS' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {log.type === 'SMS' ? <MessageSquare size={14} /> : <Mic size={14} />}
                                 </div>
                                 <div className="truncate">
                                     <p className="font-medium text-slate-800 truncate">{log.studentName} ({log.parentPhone})</p>
                                     <p className="text-xs text-slate-500 truncate">{log.message}</p>
                                 </div>
                             </div>
                             <div className="text-right flex-shrink-0 ml-2">
                                 <span className="block text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-bold">{log.status}</span>
                             </div>
                        </div>
                    ))
                )}
            </div>
          </div>
      </div>
      
      {/* Add Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{isTamil ? 'புதிய அறிவிப்பை இடுக' : 'Post New Notice'}</h3>
                    <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleAddNotice} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'தலைப்பு' : 'Title'}</label>
                        <input 
                            type="text" 
                            required
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                            placeholder={isTamil ? 'எ.கா. பள்ளி திறப்பு' : "e.g. School Reopening"}
                            value={newNotice.title}
                            onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'செய்தி' : 'Message'}</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-tn-500 focus:ring-tn-500"
                            placeholder={isTamil ? 'விவரங்களை இங்கே தட்டச்சு செய்யவும்...' : "Type the notice details here..."}
                            value={newNotice.message}
                            onChange={e => setNewNotice({...newNotice, message: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{isTamil ? 'வகை' : 'Notice Type'}</label>
                        <div className="flex gap-2">
                             {['info', 'warning', 'urgent', 'success'].map(type => (
                                 <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewNotice({...newNotice, type: type as any})}
                                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded border ${
                                        newNotice.type === type 
                                        ? `bg-${getNoticeColor(type)}-500 text-white border-${getNoticeColor(type)}-600`
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                 >
                                    {type}
                                 </button>
                             ))}
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setShowNoticeModal(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            {isTamil ? 'ரத்து செய்' : 'Cancel'}
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-tn-600 rounded-lg hover:bg-tn-700 shadow-sm"
                        >
                            {isTamil ? 'அறிவிப்பை வெளியிடு' : 'Post Notice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};