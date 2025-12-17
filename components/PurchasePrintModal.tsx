import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { PurchaseInvoice } from '../types';
import { utils, writeFile } from 'xlsx';

interface PurchasePrintModalProps {
  invoice: PurchaseInvoice;
  onClose: () => void;
}

export const PurchasePrintModal: React.FC<PurchasePrintModalProps> = ({ invoice, onClose }) => {
  const [confirmPrint, setConfirmPrint] = useState(false);
  
  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => {
      document.body.classList.remove('print-mode');
    };
  }, []);

  const handleDownloadExcel = () => {
    const rows = invoice.items.map(item => ({
        "المادة": item.name,
        "الكمية": item.quantity,
        "التكلفة": item.cost,
        "الإجمالي": item.total
    }));
    rows.push({
        "المادة": "المجموع الكلي",
        "الكمية": 0,
        "التكلفة": 0,
        "الإجمالي": invoice.totalAmount
    });
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "فاتورة شراء");
    writeFile(wb, `شراء-${invoice.supplierName}-${invoice.date.replace(/\//g, '-')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
    setConfirmPrint(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-fade-up border border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl no-print">
          <h3 className="font-bold text-lg text-white">طباعة فاتورة مشتريات</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content - Reusing ID invoice-content for print styling */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-gray-300 bg-white/5" id="invoice-content">
          <div className="text-center mb-6 border-b-2 border-gray-600 print:border-black pb-4">
            <h2 className="text-2xl font-bold mb-1 text-white print:text-black">مخبز كوكيز</h2>
            <p className="text-gray-400 font-bold print:text-gray-600">سند استلام بضاعة / فاتورة شراء</p>
            <p className="text-gray-500 print:text-gray-600 dir-ltr">{invoice.date}</p>
            <div className="mt-2 border border-dashed border-gray-600 print:border-black p-2 rounded">
                <p className="text-gray-400 text-xs mb-1">المورد:</p>
                <p className="text-white print:text-black font-bold text-lg">{invoice.supplierName}</p>
            </div>
            <div className="mt-2 inline-block px-3 py-1 border border-gray-600 print:border-black rounded-full">
               <span className="font-bold print:text-black">{invoice.paymentStatus === 'paid' ? 'مدفوع نقداً' : 'آجل (ذمم)'}</span>
            </div>
          </div>

          <table className="w-full mb-4 text-right">
             <thead>
                 <tr className="border-b border-gray-600 print:border-black">
                     <th className="py-2 text-gray-300 print:text-black">المادة</th>
                     <th className="py-2 text-center text-gray-300 print:text-black">الكمية</th>
                     <th className="py-2 text-gray-300 print:text-black">السعر</th>
                     <th className="py-2 text-gray-300 print:text-black">الإجمالي</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-700 print:divide-gray-300">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-gray-300 print:text-black font-medium">{item.name}</td>
                    <td className="py-2 text-center text-gray-300 print:text-black">
                        {item.quantity}
                    </td>
                    <td className="py-2 text-gray-300 print:text-black">{item.cost.toLocaleString('en-US')}</td>
                    <td className="py-2 font-bold text-white print:text-black">{item.total.toLocaleString('en-US')}</td>
                  </tr>
                ))}
             </tbody>
          </table>

          <div className="border-t-2 border-gray-600 print:border-black pt-4 mt-6">
            <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-white print:text-black">المجموع الكلي:</span>
                <span className="text-red-400 print:text-black">{invoice.totalAmount.toLocaleString('en-US')} ل.س</span>
            </div>
          </div>

           <div className="mt-16 hidden print:flex justify-between items-end px-8">
               <div className="text-center">
                   <p className="mb-10 font-bold text-black text-base">توقيع المورد</p>
                   <div className="w-40 border-b-2 border-black border-dotted"></div>
               </div>
               <div className="text-center">
                   <p className="mb-10 font-bold text-black text-base">توقيع المستلم</p>
                   <div className="w-40 border-b-2 border-black border-dotted"></div>
               </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 flex flex-col gap-3 bg-gray-900/50 rounded-b-2xl no-print">
            <div className="grid grid-cols-2 gap-3">
                {confirmPrint ? (
                    <div className="col-span-1 flex items-center gap-2">
                        <button onClick={handlePrint} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm">تأكيد الطباعة</button>
                        <button onClick={() => setConfirmPrint(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-xl font-bold text-sm">إلغاء</button>
                    </div>
                ) : (
                    <button 
                    onClick={() => setConfirmPrint(true)}
                    className="col-span-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-white shadow-md bg-[#FA8072] hover:bg-[#e67365]"
                    >
                    <Printer size={18} />
                    <span>طباعة PDF</span>
                    </button>
                )}
                
                <button 
                    onClick={handleDownloadExcel}
                    className="col-span-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-white shadow-md bg-green-700 hover:bg-green-600"
                >
                    <FileSpreadsheet size={18} />
                    <span>تصدير Excel</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};