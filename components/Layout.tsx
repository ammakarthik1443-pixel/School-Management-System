import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, GraduationCap, 
  FileText, CalendarCheck, LogOut, Menu, X, 
  School, Languages, ClipboardList 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, language, toggleLanguage } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isTamil = language === 'ta';

  const menuItems = [
    { label: isTamil ? 'முகப்பு' : 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: isTamil ? 'மாணவர்கள்' : 'Students', icon: GraduationCap, path: '/students', visible: isAdmin || isTeacher },
    { label: isTamil ? 'ஆசிரியர்கள்' : 'Staff', icon: Users, path: '/teachers', visible: isAdmin },
    { label: isTamil ? 'வருகைப் பதிவு' : 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { label: isTamil ? 'தேர்வுகள்' : 'Exams & Marks', icon: ClipboardList, path: '/exams' },
    { label: isTamil ? 'ஆவணங்கள்' : 'Documents', icon: FileText, path: '/documents' },
  ];

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return '';
    if (isTamil) {
        if (role === 'ADMIN') return 'தலைமை ஆசிரியர்';
        if (role === 'TEACHER') return 'ஆசிரியர்';
        if (role === 'STUDENT') return 'மாணவர்';
    }
    return role.toLowerCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <School className="w-8 h-8 text-tn-500" />
            <div>
              <h1 className="text-lg font-bold leading-none">{isTamil ? 'அரசு பள்ளி' : 'Govt School'}</h1>
              <p className="text-xs text-slate-400">{isTamil ? 'மேலாண்மை அமைப்பு' : 'Management System'}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-2 space-y-1">
          {menuItems.filter(item => item.visible !== false).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path 
                  ? 'bg-tn-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center mb-4">
            <img 
              src={user?.avatar} 
              alt="User" 
              className="h-10 w-10 rounded-full border-2 border-tn-500"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isTamil ? 'வெளியேறு' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1"></div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Languages className="w-4 h-4 mr-1.5" />
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};