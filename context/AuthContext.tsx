import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Student, Teacher, DocumentItem, Exam, AttendanceRecord, Notice, CommunicationLog, TimeTable, Mark, LeaveApplication } from '../types';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_DOCUMENTS, MOCK_EXAMS, MOCK_ATTENDANCE, MOCK_NOTICES, MOCK_TIMETABLES, MOCK_MARKS, MOCK_LEAVES } from '../mockData';

interface AuthContextType {
  user: User | null;
  language: 'en' | 'ta';
  toggleLanguage: () => void;
  login: (email: string, role: Role, name?: string) => void;
  logout: () => void;
  
  // Data State (Simulating DB)
  students: Student[];
  teachers: Teacher[];
  documents: DocumentItem[];
  exams: Exam[];
  attendance: AttendanceRecord[];
  notices: Notice[];
  communicationLogs: CommunicationLog[];
  timeTables: TimeTable[];
  marks: Mark[];
  leaves: LeaveApplication[];
  
  // Data Actions
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  addTeacher: (t: Teacher) => void;
  addDocument: (d: DocumentItem) => void;
  addExam: (e: Exam) => void;
  addNotice: (n: Notice) => void;
  deleteNotice: (id: string) => void;
  markAttendance: (studentId: string, status: AttendanceRecord['status']) => void;
  markBatchAttendance: (records: { studentId: string; status: AttendanceRecord['status'] }[]) => void;
  saveTimeTable: (t: TimeTable) => void;
  saveBatchMarks: (marks: Mark[]) => void;
  applyLeave: (l: LeaveApplication) => void;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  
  // Global Data State
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [timeTables, setTimeTables] = useState<TimeTable[]>(MOCK_TIMETABLES);
  const [marks, setMarks] = useState<Mark[]>(MOCK_MARKS);
  const [leaves, setLeaves] = useState<LeaveApplication[]>(MOCK_LEAVES);

  const login = (email: string, role: Role, name?: string) => {
    // Mock login logic
    const mockUser: User = {
      id: 'u1',
      name: name || (role === 'ADMIN' ? 'Headmaster' : role === 'TEACHER' ? 'Mrs. Kavitha S' : 'Karthik Raja'),
      email: email,
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || role)}&background=0D8ABC&color=fff`
    };
    setUser(mockUser);
    localStorage.setItem('user_role', role); // Simple persistence
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_role');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  // Check for existing session
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as Role;
    if (savedRole) {
      login('restored@session.com', savedRole);
    }
  }, []);

  // Data Actions
  const addStudent = (s: Student) => setStudents([...students, s]);
  
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const addTeacher = (t: Teacher) => setTeachers([...teachers, t]);
  const addDocument = (d: DocumentItem) => setDocuments([d, ...documents]);
  const addExam = (e: Exam) => setExams([...exams, e]);
  const addNotice = (n: Notice) => setNotices([n, ...notices]);
  const deleteNotice = (id: string) => setNotices(notices.filter(n => n.id !== id));
  
  const saveTimeTable = (newTimeTable: TimeTable) => {
    setTimeTables(prev => {
        const existingIndex = prev.findIndex(t => t.class === newTimeTable.class && t.section === newTimeTable.section);
        if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newTimeTable;
            return updated;
        }
        return [...prev, newTimeTable];
    });
  };

  const saveBatchMarks = (newMarks: Mark[]) => {
    setMarks(prev => {
        // Filter out old marks that match studentId+examId of new marks
        const otherMarks = prev.filter(m => !newMarks.some(nm => nm.studentId === m.studentId && nm.examId === m.examId));
        return [...otherMarks, ...newMarks];
    });
  };
  
  const applyLeave = (l: LeaveApplication) => setLeaves([l, ...leaves]);
  
  const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const markAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        date: today,
        status
    };
    
    // Remove existing for today if any, then add new
    setAttendance(prev => {
        const filtered = prev.filter(a => !(a.studentId === studentId && a.date === today));
        return [...filtered, newRecord];
    });
  };

  const markBatchAttendance = (records: { studentId: string; status: AttendanceRecord['status'] }[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Update Attendance State
    setAttendance(prev => {
        // Remove existing records for today for the students being updated
        const studentIdsToUpdate = new Set(records.map(r => r.studentId));
        const filtered = prev.filter(a => !(studentIdsToUpdate.has(a.studentId) && a.date === today));
        
        const newRecords = records.map(r => ({
            id: Math.random().toString(36).substr(2, 9),
            studentId: r.studentId,
            date: today,
            status: r.status
        }));
        
        return [...filtered, ...newRecords];
    });

    // 2. Trigger Auto Message + Auto Voice Note Workflow for Absentees
    const newLogs: CommunicationLog[] = [];
    const currentTime = new Date().toISOString();

    records.forEach(record => {
        // Trigger: IF attendance_status == "Absent"
        if (record.status === 'Absent') {
            // Get Parent Details
            const student = students.find(s => s.id === record.studentId);
            
            if (student) {
                // Fetch details
                const parentPhone = student.phone; // Assuming student record has parent phone
                const studentName = student.name;
                
                // Create Message Text
                const messageText = `Dear Parent, your child ${studentName} is absent today (${today}). Please check.`;
                
                // --- Step A: Send SMS ---
                newLogs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    studentName: studentName,
                    parentPhone: parentPhone,
                    message: `[SMS] ${messageText}`,
                    type: 'SMS',
                    timestamp: currentTime,
                    status: 'Sent'
                });

                // --- Step B: Convert to Voice Note (TTS) & Send ---
                // Simulating TextToSpeech block and SendMessage block
                newLogs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    studentName: studentName,
                    parentPhone: parentPhone,
                    message: `[Voice Note] ${messageText} (0:15s)`,
                    type: 'Voice Note',
                    timestamp: currentTime,
                    status: 'Sent'
                });
            }
        }
    });

    if (newLogs.length > 0) {
        setCommunicationLogs(prev => [...newLogs, ...prev]);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, language, toggleLanguage, login, logout,
      students, teachers, documents, exams, attendance, notices, communicationLogs, timeTables, marks, leaves,
      addStudent, updateStudent, addTeacher, addDocument, addExam, addNotice, deleteNotice, markAttendance, markBatchAttendance, saveTimeTable, saveBatchMarks, applyLeave, updateLeaveStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};