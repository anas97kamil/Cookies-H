import React, { useRef, useState } from 'react';
import { X, Download, Upload, Database, AlertTriangle, FileJson, Check, Trash2, Share2, Cloud } from 'lucide-react';

interface DataManagementModalProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ onExport, onImport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    // Reset value to allow selecting the same file again if user cancels and retries
    if (e.target) e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;
    onImport(selectedFile);
    onClose();
  };

  const clearSelection = () => {
      setSelectedFile(null);
  };

  const handleShareToDrive = async () => {
      // 1. Create the data payload
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const history = JSON.parse(localStorage.getItem('salesHistory') || '[]');
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      const data = { appVersion: '1.1', timestamp: Date.now(), sales, history, products, customers };
      const fileName = `cookies-bakery-backup-${new Date().toLocaleDateString('ar-SY').replace(/\//g, '-')}.json`;
      
      const file = new File([JSON.stringify(data, null, 2)], fileName, {
          type: 'application/json',
      });

      // 2. Use Web Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
              await navigator.share({
                  files: [file],
                  title: 'نسخة احتياطية - مخبز كوكيز',
                  text: 'ملف النسخة الاحتياطية لنظام المبيعات',
              });
              // Note: User should select "Drive" from the share sheet
          } catch (error) {
              console.log('Error sharing:', error);
          }
      } else {
          alert('المشاركة المباشرة غير مدعومة في هذا المتصفح. يرجى استخدام زر "تحميل ملف البيانات" ثم رفعه يدوياً.');
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-700 animate-fade-up flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Database size={20} className="text-[#FA8072]" />
            <h3 className="font-bold text-lg">النسخ الاحتياطي والاستعادة</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Export Section */}
            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
                <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Download size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">تصدير نسخة احتياطية</h4>
                        <p className="text-gray-400 text-xs mt-1">
                            حفظ البيانات على جهازك أو رفعها إلى السحابة.
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        تحميل (جهاز)
                    </button>
                    
                    <button 
                        onClick={handleShareToDrive}
                        className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                        <Cloud size={16} />
                        Google Drive
                    </button>
                </div>
                 <p className="text-[10px] text-gray-500 mt-2 text-center">
                    * لمزامنة جوجل درايف: اضغط الزر الأخضر ثم اختر تطبيق "Drive" من القائمة.
                </p>
            </div>

            {/* Import Section */}
            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
                <div className="flex items-start gap-3 mb-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">استيراد بيانات (Restore)</h4>
                        <p className="text-gray-400 text-xs mt-1">
                            استرجاع البيانات من ملف محفوظ مسبقاً.
                        </p>
                    </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-200 leading-relaxed">
                        تحذير: هذه العملية ستقوم بمسح جميع البيانات الحالية واستبدالها بالبيانات الموجودة في الملف الذي ستختاره.
                    </p>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />

                {!selectedFile ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-gray-500 border-dashed hover:border-solid"
                    >
                        <Upload size={18} />
                        اضغط هنا لاختيار ملف النسخة الاحتياطية
                    </button>
                ) : (
                    <div className="space-y-3 animate-fade-up">
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-green-900/50 p-2 rounded">
                                    <FileJson className="text-green-400" size={24} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm text-white font-medium truncate dir-ltr text-left">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={clearSelection}
                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                title="إلغاء الملف"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <button 
                            onClick={handleConfirmImport}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <Check size={18} />
                            تأكيد واستعادة البيانات الآن
                        </button>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};