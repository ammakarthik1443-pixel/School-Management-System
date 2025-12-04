export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  emisNumber: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  class: string;
  section: string;
  bloodGroup: string;
  community: string;
  religion: string;
  motherTongue: string;
  fatherName: string;
  motherName: string;
  phone: string;
  address: string;
  aadhar: string;
  admissionDate: string;
  imageUrl?: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age?: number;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  imageUrl?: string;
  
  // Professional
  designation: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  joiningDate: string;
  status: 'Permanent' | 'Temporary' | 'Contract';
  
  // Personal Extras
  bloodGroup?: string;
  religion?: string;
  community?: string;
  maritalStatus?: string;
  nationality?: string;
  
  // ID & Banking
  aadharNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  
  // Family & Emergency
  spouseName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Health
  medicalConditions?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  class: string;
  subject: string;
  totalMarks: number;
}

export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  obtainedMarks: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Circular' | 'Material' | 'Form' | 'Certificate';
  uploadedBy: string;
  date: string;
  size: string;
  type: string;
  url?: string; // For mock download
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  postedBy: string;
}

export interface CommunicationLog {
  id: string;
  studentName: string;
  parentPhone: string;
  message: string;
  type: 'SMS' | 'Voice Note';
  timestamp: string;
  status: 'Sent' | 'Failed';
}

export interface Stat {
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

export interface TimeTableDay {
  day: string;
  periods: string[]; // Array of 8 strings representing subjects
}

export interface TimeTable {
  id: string;
  class: string;
  section: string;
  schedule: TimeTableDay[];
}

export interface LeaveApplication {
  id: string;
  userId: string;       // Generic ID
  userName: string;     // Generic Name
  userRole: Role;       // To distinguish Student vs Teacher
  class?: string;       // Students Only
  section?: string;     // Students Only
  designation?: string; // Teachers Only
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}