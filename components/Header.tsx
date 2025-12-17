import React, { useState, useEffect } from 'react';
import { FileText, History, Database, Wifi, WifiOff, RefreshCw, Clock, Calendar, Download, Wallet } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenDataManagement: () => void;
  onOpenExpenses: () => void;
  isOnline: boolean;
  lastSyncTime: Date;
  onManualSync: () => void;
  isSyncing: boolean;
  installPrompt?: any;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenHistory, 
  onOpenDataManagement, 
  onOpenExpenses,
  isOnline,
  lastSyncTime,
  onManualSync,
  isSyncing,
  installPrompt,
  onInstall
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#1F2937] border-b border-gray-700 shadow-lg sticky top-0 z-40 no-print">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Right Section: Identity & Status */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                 <div className="flex items-center gap-3">
                     {/* Logo Icon */}
                     <div className="bg-gradient-to-br from-[#FA8072] to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-900/20">
                       <FileText className="text-white" size={20} />
                     </div>
                     
                     {/* Title & Status */}
                     <div className="flex flex-col">
                        <h1 className="font-bold text-lg text-white leading-tight">نظام المبيعات</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-medium">مخبز كوكيز</span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            {/* Online Status Badge */}
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                                <span>{isOnline ? 'متصل' : 'أوفلاين'}</span>
                            </div>
                        </div>
                     </div>
                 </div>

                 {/* Mobile Clock (Visible on small screens, Right side) */}
                 <div className="md:hidden flex flex-col items-end justify-center bg-[#FA8072]/10 border border-[#FA8072]/20 text-white px-3 py-1 rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#FA8072]">
                         <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                         <Clock size={10} />
                    </div>
                 </div>
            </div>
            
            {/* Left Section: Actions Toolbar */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                 
                 {/* Install Button (PWA) - Only shows if available */}
                 {installPrompt && onInstall && (
                    <button
                        onClick={onInstall}
                        className="flex items-center gap-1 bg-[#FA8072] hover:bg-[#e67365] text-white px-3 py-1.5 rounded-xl transition-all shadow-md mr-1 animate-pulse"
                        title="تثبيت التطبيق على الجهاز"
                    >
                        <Download size={14} />
                        <span className="text-xs font-bold">تثبيت التطبيق</span>
                    </button>
                 )}

                 {/* Sync Section */}
                 <div className="flex items-center gap-2 bg-gray-900/60 rounded-xl px-2 py-1 border border-gray-700 mr-1">
                    <div className="flex flex-col items-end pr-1">
                        <span className="text-[9px] text-gray-500 font-medium">آخر مزامنة</span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-300 font-mono">
                            <Clock size={10} />
                            {lastSyncTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <button 
                        onClick={onManualSync}
                        disabled={isSyncing}
                        className={`p-2 rounded-lg transition-all ${isSyncing ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 hover:bg-gray-600 text-white hover:text-[#FA8072]'} active:scale-95`}
                        title="تحديث البيانات (مزامنة)"
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    </button>
                 </div>

                 <div className="w-px h-6 bg-gray-700 mx-1"></div>

                 {/* Action Buttons Group */}
                 <div className="flex items-center gap-1">
                    <button 
                        onClick={onOpenExpenses}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-colors group"
                        title="المصاريف والمشتريات"
                    >
                        <Wallet size={18} className="group-hover:text-red-400 transition-colors" />
                        <span className="text-xs font-bold hidden lg:inline">المصاريف</span>
                    </button>

                    <button 
                        onClick={onOpenDataManagement}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-colors group"
                        title="إدارة البيانات"
                    >
                        <Database size={18} className="group-hover:text-blue-400 transition-colors" />
                        <span className="text-xs font-bold hidden lg:inline">البيانات</span>
                    </button>

                    <button 
                        onClick={onOpenHistory}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-colors group"
                        title="سجل المبيعات"
                    >
                        <History size={18} className="group-hover:text-purple-400 transition-colors" />
                        <span className="text-xs font-bold hidden lg:inline">الأرشيف</span>
                    </button>
                 </div>
                 
                 {/* Desktop Clock */}
                 <div className="hidden md:flex flex-col items-end justify-center bg-[#FA8072] text-white px-3 py-1 rounded-xl shadow-md ml-1 min-w-[100px]">
                    <div className="flex items-center gap-1.5 font-bold text-xs border-b border-white/20 pb-0.5 w-full justify-end">
                         <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                         <Clock size={10} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium pt-0.5 w-full justify-end">
                        <span>{currentTime.toLocaleDateString('en-GB')}</span>
                        <Calendar size={10} />
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </header>
  );
};