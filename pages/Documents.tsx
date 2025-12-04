import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Trash2, UploadCloud, File, Search } from 'lucide-react';
import { DocumentItem } from '../types';

export const Documents = () => {
  const { documents, addDocument, user, language } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === 'ADMIN';
  const isTamil = language === 'ta';

  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Max 10MB.");
        return;
      }
      
      const newDoc: DocumentItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        category: 'Material',
        uploadedBy: user?.name || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.name.split('.').pop() || 'file'
      };
      
      addDocument(newDoc);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">{isTamil ? 'ஆவண காப்பகம்' : 'Document Repository'}</h1>
            <p className="text-sm text-slate-500">{isTamil ? 'சுற்றறிக்கைகள் மற்றும் சான்றிதழ்களுக்கான பாதுகாப்பான சேமிப்பு.' : 'Secure storage for circulars, materials, and certificates.'}</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center bg-tn-600 text-white px-4 py-2 rounded-lg hover:bg-tn-700 transition shadow-sm"
                >
                    <UploadCloud className="w-4 h-4 mr-2" /> {isTamil ? 'ஆவணம் பதிவேற்று' : 'Upload Document'}
                </button>
            </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
                type="text"
                placeholder={isTamil ? "ஆவணங்களை தலைப்பு அல்லது வகை மூலம் தேடு..." : "Search documents by title or category..."}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 outline-none transition text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-tn-300 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-tn-50 transition-colors">
                            <FileText className="w-6 h-6 text-slate-500 group-hover:text-tn-600" />
                        </div>
                        {isAdmin && (
                            <button className="text-slate-300 hover:text-red-500 transition">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 truncate" title={doc.title}>{doc.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{doc.category} • {doc.size} • {doc.date}</p>
                        <p className="text-xs text-slate-400 mt-1">{isTamil ? 'பதிவேற்றியவர்' : 'By'}: {doc.uploadedBy}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <button className="w-full flex items-center justify-center py-2 text-sm text-tn-600 bg-tn-50 hover:bg-tn-100 rounded-md transition font-medium">
                            <Download className="w-4 h-4 mr-2" /> {isTamil ? 'பதிவிறக்கு' : 'Download'}
                        </button>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>{isTamil ? 'ஆவணங்கள் எதுவும் கிடைக்கவில்லை.' : 'No documents found matching your search.'}</p>
            </div>
        )}
      </div>
    </div>
  );
};