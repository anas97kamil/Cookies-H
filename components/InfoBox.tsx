import React, { useState } from 'react';
import { DollarSign, Lock, Eye, EyeOff, X, TrendingUp } from 'lucide-react';
import { SaleItem } from '../types';

interface SummaryProps {
  items: SaleItem[];
  onPreview: () => void;
}

export const Summary: React.FC<SummaryProps> = ({ items, onPreview }) => {
  const [showRevenue, setShowRevenue] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const totalRevenue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === '1997') {
          setShowRevenue(true);
          setShowModal(false);
          setPassword('');
          setError(false);
      } else {
          setError(true);
          setPassword('');
      }
  };

  return (
    <>
        {/* Custom Password Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-up">
                <div className="bg-gray-800 border border-gray-600 w-full max-w-xs p-6 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">إلغاء إخفاء الأرقام</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div>
                            <input 
                                type="password" 
                                autoFocus
                                placeholder="أدخل كلمة المرور"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                className={`w-full bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-600'} text-white px-4 py-2 rounded-xl text-center outline-none focus:border-[#FA8072]`}
                            />
                            {error && <p className="text-red-400 text-xs mt-2 text-center">كلمة المرور غير صحيحة</p>}
                        </div>
                        <button type="submit" className="w-full bg-[#FA8072] hover:bg-[#e67365] text-white font-bold py-2 rounded-xl transition-colors">
                            تأكيد
                        </button>
                    </form>
                </div>
            </div>
        )}

        <div className="mb-6 print-break-inside-avoid">
             {/* Full Width Sales Card */}
            <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg border border-gray-700 relative overflow-hidden flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-gray-400 text-sm font-medium">إجمالي المبيعات اليومية</p>
                        {showRevenue ? (
                            <button onClick={() => setShowRevenue(false)} className="text-gray-500 hover:text-white print:hidden" title="إخفاء">
                                <EyeOff size={14} />
                            </button>
                        ) : (
                            <Lock size={12} className="text-gray-500" />
                        )}
                    </div>
                    
                    <div className="relative">
                        <h3 className={`text-4xl font-bold text-[#FA8072] transition-all duration-500 ${showRevenue ? '' : 'blur-md select-none opacity-40'}`}>
                            {totalRevenue.toLocaleString('en-US')} 
                            <span className="text-sm text-gray-500 font-normal"> ل.س</span>
                        </h3>
                        {!showRevenue && (
                            <button onClick={() => setShowModal(true)} className="absolute inset-0 w-full h-full z-10 outline-none cursor-pointer"></button>
                        )}
                    </div>
                </div>
                <div className="hidden md:block bg-[#FA8072]/10 p-4 rounded-full">
                    <TrendingUp size={32} className="text-[#FA8072]" />
                </div>
            </div>
        </div>
    </>
  );
};