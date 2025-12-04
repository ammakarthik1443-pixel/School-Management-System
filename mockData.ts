import { Student, Teacher, DocumentItem, Exam, AttendanceRecord, Notice, TimeTable, Mark, LeaveApplication } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    emisNumber: '330201001',
    name: 'Karthik Raja',
    gender: 'Male',
    dob: '2010-05-12',
    class: '10',
    section: 'A',
    bloodGroup: 'B+',
    community: 'BC',
    religion: 'Hindu',
    motherTongue: 'Tamil',
    fatherName: 'Raja S',
    motherName: 'Lakshmi R',
    phone: '9876543210',
    address: '12, North Car Street, Madurai',
    aadhar: '123412341234',
    admissionDate: '2020-06-01'
  },
  {
    id: 's2',
    emisNumber: '330201002',
    name: 'Priya Dharshini',
    gender: 'Female',
    dob: '2010-08-22',
    class: '10',
    section: 'A',
    bloodGroup: 'O+',
    community: 'MBC',
    religion: 'Hindu',
    motherTongue: 'Tamil',
    fatherName: 'Murugan P',
    motherName: 'Selvi M',
    phone: '9876543211',
    address: '45, Anna Nagar, Trichy',
    aadhar: '567856785678',
    admissionDate: '2020-06-01'
  },
  {
    id: 's3',
    emisNumber: '330201003',
    name: 'Abdul Basith',
    gender: 'Male',
    dob: '2011-01-15',
    class: '9',
    section: 'B',
    bloodGroup: 'A+',
    community: 'BCM',
    religion: 'Muslim',
    motherTongue: 'Urdu',
    fatherName: 'Rahim A',
    motherName: 'Fathima R',
    phone: '9876543212',
    address: '7, Mosque Street, Chennai',
    aadhar: '901290129012',
    admissionDate: '2021-06-01'
  }
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 't1',
    employeeId: 'EMP001',
    name: 'Mrs. Kavitha S',
    designation: 'PG Assistant',
    subject: 'Mathematics',
    phone: '9988776655',
    email: 'kavitha.math@school.gov.in',
    qualification: 'M.Sc, B.Ed',
    joiningDate: '2015-06-01',
    dob: '1985-05-15',
    gender: 'Female',
    experienceYears: 12,
    status: 'Permanent',
    address: '123, Teacher Colony, Madurai',
    bloodGroup: 'O+',
    religion: 'Hindu',
    aadharNumber: '998877665544'
  },
  {
    id: 't2',
    employeeId: 'EMP002',
    name: 'Mr. David Raj',
    designation: 'BT Assistant',
    subject: 'Science',
    phone: '9988776644',
    email: 'david.sci@school.gov.in',
    qualification: 'B.Sc, B.Ed',
    joiningDate: '2018-06-01',
    dob: '1990-08-20',
    gender: 'Male',
    experienceYears: 8,
    status: 'Permanent',
    address: '45, Church Road, Trichy',
    bloodGroup: 'B+',
    religion: 'Christian',
    aadharNumber: '112233445566'
  }
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 'd1', title: 'Annual Exam Schedule 2024', category: 'Circular', uploadedBy: 'Admin', date: '2023-10-25', size: '250 KB', type: 'pdf' },
  { id: 'd2', title: '10th Std Math Question Bank', category: 'Material', uploadedBy: 'Mrs. Kavitha S', date: '2023-10-20', size: '1.2 MB', type: 'pdf' },
  { id: 'd3', title: 'Scholarship Form (BC/MBC)', category: 'Form', uploadedBy: 'Admin', date: '2023-09-15', size: '500 KB', type: 'docx' },
];

export const MOCK_EXAMS: Exam[] = [
  { id: 'e1', name: 'Quarterly Exam', date: '2023-09-20', class: '10', subject: 'Mathematics', totalMarks: 100 },
  { id: 'e2', name: 'Quarterly Exam', date: '2023-09-22', class: '10', subject: 'Science', totalMarks: 100 },
];

export const MOCK_MARKS: Mark[] = [
  { id: 'm1', examId: 'e1', studentId: 's1', obtainedMarks: 85 },
  { id: 'm2', examId: 'e1', studentId: 's2', obtainedMarks: 92 },
  { id: 'm3', examId: 'e2', studentId: 's1', obtainedMarks: 78 },
  { id: 'm4', examId: 'e2', studentId: 's2', obtainedMarks: 88 },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'a1', studentId: 's1', date: new Date().toISOString().split('T')[0], status: 'Present' },
    { id: 'a2', studentId: 's2', date: new Date().toISOString().split('T')[0], status: 'Absent' },
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Parent-Teacher Meeting',
    message: 'Scheduled for next Friday regarding Quarter-Yearly results.',
    date: '2023-10-25',
    type: 'info',
    postedBy: 'Headmaster'
  },
  {
    id: 'n2',
    title: 'Holiday Announcement',
    message: 'School remains closed on Monday due to local festival.',
    date: '2023-10-20',
    type: 'warning',
    postedBy: 'Admin'
  }
];

export const MOCK_TIMETABLES: TimeTable[] = [
  {
    id: 'tt1',
    class: '10',
    section: 'A',
    schedule: [
      { day: 'Monday', periods: ['Tamil', 'English', 'Maths', 'Science', 'Social', 'Maths', 'PET', 'Library'] },
      { day: 'Tuesday', periods: ['English', 'Tamil', 'Science', 'Maths', 'Social', 'Science', 'Art', 'Maths'] },
      { day: 'Wednesday', periods: ['Maths', 'Science', 'Social', 'Tamil', 'English', 'PET', 'Science', 'Social'] },
      { day: 'Thursday', periods: ['Science', 'Maths', 'Tamil', 'English', 'Social', 'Maths', 'Value Ed', 'Library'] },
      { day: 'Friday', periods: ['Social', 'Social', 'Maths', 'Science', 'English', 'Tamil', 'PET', 'GK'] },
    ]
  }
];

export const MOCK_LEAVES: LeaveApplication[] = [
  {
    id: 'l1',
    userId: 's1',
    userName: 'Karthik Raja',
    userRole: 'STUDENT',
    class: '10',
    section: 'A',
    fromDate: '2023-10-30',
    toDate: '2023-10-31',
    reason: 'Fever',
    status: 'Pending',
    appliedOn: '2023-10-28'
  },
  {
    id: 'l2',
    userId: 's2',
    userName: 'Priya Dharshini',
    userRole: 'STUDENT',
    class: '10',
    section: 'A',
    fromDate: '2023-11-01',
    toDate: '2023-11-01',
    reason: 'Family Function',
    status: 'Approved',
    appliedOn: '2023-10-25'
  },
  {
    id: 'l3',
    userId: 't1',
    userName: 'Mrs. Kavitha S',
    userRole: 'TEACHER',
    designation: 'PG Assistant',
    fromDate: '2023-11-05',
    toDate: '2023-11-06',
    reason: 'Medical Leave',
    status: 'Pending',
    appliedOn: '2023-11-01'
  }
];