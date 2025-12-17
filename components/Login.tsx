import React, { useState } from 'react';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials as requested
    if (username === 'Admin' && password === '1997') {
      setError('');
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4" dir="rtl">
      <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-700 animate-fade-up">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4 relative group">
             <div className="absolute inset-0 bg-[#FA8072]/20 blur-xl rounded-full"></div>
             <img 
                src="/logo.png" 
                alt="Logo" 
                className="relative h-24 w-auto object-contain drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
             />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">مخبز كوكيز</h1>
          <p className="text-gray-400 text-sm">يرجى تسجيل الدخول للمتابعة</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User size={16} className="text-[#FA8072]" />
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 outline-none focus:border-[#FA8072] focus:ring-1 focus:ring-[#FA8072] transition-all text-left dir-ltr placeholder:text-right"
              placeholder="Username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Lock size={16} className="text-[#FA8072]" />
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 outline-none focus:border-[#FA8072] focus:ring-1 focus:ring-[#FA8072] transition-all text-left dir-ltr placeholder:text-right"
              placeholder="••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#FA8072] hover:bg-[#e67365] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FA8072]/20 active:scale-95"
          >
            <LogIn size={20} />
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-600">
          نسخة النظام v1.0 &copy; 2024
        </div>
      </div>
    </div>
  );
};