import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, User, Lock, ArrowRight, Mail, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { Role } from '../types';

export const Login = () => {
  const { login, language, toggleLanguage } = useAuth();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const isTamil = language === 'ta';

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<Role>('STUDENT');
  const [signupError, setSignupError] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'demo@school.gov.in', selectedRole);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      setSignupError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்' : 'Password must be at least 6 characters');
      return;
    }
    // Proceed to login with new credentials (mock)
    login(signupEmail, signupRole, signupName);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      setResetSent(true);
      setTimeout(() => {
        setView('login');
        setResetSent(false);
        setForgotEmail('');
      }, 3000);
    }
  };

  const RoleSelector = ({ role, setRole }: { role: Role, setRole: (r: Role) => void }) => (
    <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg mb-6">
      {(['ADMIN', 'TEACHER', 'STUDENT'] as Role[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          className={`text-xs font-medium py-2 px-2 rounded-md transition-all ${
            role === r 
            ? 'bg-white text-tn-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {r === 'ADMIN' ? (isTamil ? 'தலைமை ஆசிரியர்' : 'Admin') : 
           r === 'TEACHER' ? (isTamil ? 'ஆசிரியர்' : 'Teacher') : 
           (isTamil ? 'மாணவர்' : 'Student')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-tn-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        <div className="bg-slate-900 p-8 text-center relative">
            <div className="absolute top-4 right-4">
                <button onClick={toggleLanguage} className="text-xs text-white bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
                    {isTamil ? 'English' : 'தமிழ்'}
                </button>
            </div>
          <div className="mx-auto w-16 h-16 bg-tn-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isTamil ? 'அரசு பள்ளி மேலாண்மை' : 'Govt School Management'}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isTamil ? 'தமிழ்நாடு அரசு' : 'Government of Tamil Nadu'}
          </p>
        </div>

        <div className="p-8">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 text-center">{isTamil ? 'உள்ளே நுழைய' : 'Login to Account'}</h2>
              
              <RoleSelector role={selectedRole} setRole={setSelectedRole} />

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={isTamil ? 'பயனர் பெயர் / மின்னஞ்சல்' : "Username / Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder={isTamil ? 'கடவுச்சொல்' : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2 rounded text-tn-600 focus:ring-tn-500" />
                  {isTamil ? 'நினைவில் கொள்க' : 'Remember me'}
                </label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-tn-600 hover:text-tn-800 font-medium"
                >
                  {isTamil ? 'கடவுச்சொல் மறந்ததா?' : 'Forgot Password?'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-tn-600 to-tn-500 hover:from-tn-700 hover:to-tn-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                {isTamil ? 'உள்ளே நுழைய' : 'Login'} <ArrowRight className="ml-2 w-4 h-4" />
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  {isTamil ? 'புதிய கணக்கு வேண்டுமா?' : "Don't have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-tn-600 font-bold hover:underline"
                  >
                    {isTamil ? 'பதிவு செய்க' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 text-center">{isTamil ? 'புதிய கணக்கு பதிவு' : 'Create Account'}</h2>
              
              <RoleSelector role={signupRole} setRole={setSignupRole} />

              {signupError && (
                <div className="bg-red-50 text-red-600 text-xs p-2 rounded flex items-center">
                    <span className="mr-1">⚠️</span> {signupError}
                </div>
              )}

              <div className="space-y-3">
                 <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={isTamil ? 'முழு பெயர்' : "Full Name"}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder={isTamil ? 'மின்னஞ்சல்' : "Email Address"}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder={isTamil ? 'கடவுச்சொல்' : "Password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder={isTamil ? 'கடவுச்சொல்லை உறுதிப்படுத்துக' : "Confirm Password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mt-4"
              >
                {isTamil ? 'பதிவு செய்' : 'Register'} <UserPlus className="ml-2 w-4 h-4" />
              </button>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setView('login')}
                  className="text-slate-500 text-sm hover:text-slate-700 flex items-center justify-center w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> {isTamil ? 'திரும்பச் செல்' : 'Back to Login'}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
             <form onSubmit={handleForgotPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-slate-800 text-center">{isTamil ? 'கடவுச்சொல்லை மீட்டமைக்க' : 'Reset Password'}</h2>
               
               {resetSent ? (
                 <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-green-800 font-medium">{isTamil ? 'மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Reset link sent!'}</p>
                    <p className="text-green-600 text-sm mt-1">{isTamil ? 'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்.' : 'Please check your email.'}</p>
                 </div>
               ) : (
                 <>
                    <p className="text-slate-500 text-sm text-center">
                        {isTamil 
                        ? 'உங்கள் கணக்குடன் இணைக்கப்பட்ட மின்னஞ்சலை உள்ளிடவும்.' 
                        : 'Enter the email address associated with your account.'}
                    </p>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            required
                            placeholder={isTamil ? 'மின்னஞ்சல்' : "Email Address"}
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 bg-gray-50 focus:bg-white"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3 px-4 bg-tn-600 hover:bg-tn-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        {isTamil ? 'இணைப்பை அனுப்பு' : 'Send Reset Link'}
                    </button>
                 </>
               )}

               <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setView('login')}
                  className="text-slate-500 text-sm hover:text-slate-700 flex items-center justify-center w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> {isTamil ? 'திரும்பச் செல்' : 'Back to Login'}
                </button>
              </div>
             </form>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-gray-400">
              © 2024 School Education Department. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};