import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileSpreadsheet } from 'lucide-react';
import { SaleItem } from '../types';
import { utils, writeFile } from 'xlsx';

interface InvoiceModalProps {
  items: SaleItem[];
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ items, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [confirmPrint, setConfirmPrint] = useState(false);
  
  const totalRevenue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const dateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY with English digits
  const firstItem = items[0];
  const uniqueCustomers = new Set(items.map(i => i.customerNumber));
  const isSingleCustomer = uniqueCustomers.size === 1;
  // Use explicit customer name if available, otherwise fallback to generic if single customer
  const customerName = firstItem?.customerName || (isSingleCustomer ? `زبون رقم ${firstItem.customerNumber}` : 'مبيعات مجمعة');
  const isWholesale = firstItem?.saleType === 'wholesale';

  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => {
      document.body.classList.remove('print-mode');
    };
  }, []);

  const getInvoiceText = () => {
    let text = `*فاتورة - مخبز كوكيز*\n`;
    text += `التاريخ: ${dateStr}\n`;
    text += `العميل: ${customerName}\n`;
    text += `------------------\n`;
    items.forEach(item => {
      text += `- ${item.name}: ${item.quantity} × ${item.price} = ${(item.price * item.quantity).toLocaleString('en-US')}\n`;
    });
    text += `------------------\n`;
    text += `*الإجمالي: ${totalRevenue.toLocaleString('en-US')} ل.س*\n`;
    return text;
  };

  const handleCopy = () => {
    const text = getInvoiceText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadExcel = () => {
    const rows = items.map(item => ({
        "المادة": item.name,
        "العميل": item.customerName || `زبون ${item.customerNumber}`,
        "الكمية": item.quantity,
        "السعر": item.price,
        "الإجمالي": item.price * item.quantity
    }));
    rows.push({
        "المادة": "المجموع الكلي",
        "العميل": "",
        "الكمية": 0,
        "السعر": 0,
        "الإجمالي": totalRevenue
    });
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "الفاتورة");
    writeFile(wb, `فاتورة-${Date.now()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
    setConfirmPrint(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-fade-up border border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl no-print">
          <h3 className="font-bold text-lg text-white">معاينة الفاتورة</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-gray-300 bg-white/5" id="invoice-content">
          <div className="text-center mb-6 border-b-2 border-gray-600 print:border-black pb-4">
            <h2 className="text-2xl font-bold mb-1 text-white print:text-black">مخبز كوكيز</h2>
            <p className="text-gray-400 font-bold print:text-gray-600">فاتورة مبيعات {isWholesale ? '(جملة)' : '(مفرق)'}</p>
            <p className="text-gray-500 print:text-gray-600 dir-ltr">{dateStr}</p>
            <div className="mt-2 border border-dashed border-gray-600 print:border-black p-2 rounded">
                <p className="text-white print:text-black font-bold text-lg">{customerName}</p>
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
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-gray-300 print:text-black font-medium">{item.name}</td>
                    <td className="py-2 text-center text-gray-300 print:text-black">
                        {item.quantity} {item.unitType === 'kg' ? 'كغ' : ''}
                    </td>
                    <td className="py-2 text-gray-300 print:text-black">{item.price.toLocaleString('en-US')}</td>
                    <td className="py-2 font-bold text-white print:text-black">{(item.price * item.quantity).toLocaleString('en-US')}</td>
                  </tr>
                ))}
             </tbody>
          </table>

          <div className="border-t-2 border-gray-600 print:border-black pt-4 mt-6">
            <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-white print:text-black">المجموع الكلي:</span>
                <span className="text-[#FA8072] print:text-black">{totalRevenue.toLocaleString('en-US')} ل.س</span>
            </div>
          </div>

           <div className="mt-16 hidden print:flex justify-between items-end px-8">
               <div className="text-center">
                   <p className="mb-10 font-bold text-black text-base">المستلم</p>
                   <div className="w-40 border-b-2 border-black border-dotted"></div>
               </div>
               <div className="text-center">
                   <p className="mb-10 font-bold text-black text-base">الإدارة</p>
                   <div className="w-40 border-b-2 border-black border-dotted"></div>
               </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 flex flex-col gap-3 bg-gray-900/50 rounded-b-2xl no-print">
            <div className="grid grid-cols-2 gap-3">
                {confirmPrint ? (
                    <div className="col-span-1 flex items-center gap-2">
                        <button onClick={handlePrint} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm">تأكيد</button>
                        <button onClick={() => setConfirmPrint(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-xl font-bold text-sm">إلغاء</button>
                    </div>
                ) : (
                    <button 
                    onClick={() => setConfirmPrint(true)}
                    className="col-span-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-white shadow-md bg-[#FA8072] hover:bg-[#e67365]"
                    >
                    <Download size={18} />
                    <span>تحميل PDF</span>
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
            
            <button onClick={handleCopy} className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-white shadow-md ${copied ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? 'تم النسخ' : 'نسخ نصي'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};