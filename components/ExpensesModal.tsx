import React, { useState, useMemo, Suspense } from 'react';
import { Plus, Trash2, X, ShoppingCart, Folder, FileText, CheckCircle, Clock, Download, Printer, UserPlus } from 'lucide-react';
import { PurchaseInvoice, PurchaseItem, ArchivedDay, PaymentStatus, Supplier } from '../types';

const PurchasePrintModal = React.lazy(() => import('./PurchasePrintModal').then(module => ({ default: module.PurchasePrintModal })));

interface ExpensesModalProps {
  currentPurchases: PurchaseInvoice[];
  archivedHistory: ArchivedDay[]; 
  onAddInvoice: (invoice: PurchaseInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  // Suppliers Props
  suppliers?: Supplier[];
  onAddSupplier?: (supplier: Omit<Supplier, 'id'>) => void;
  onDeleteSupplier?: (id: string) => void;
}

type Tab = 'new' | 'history';

export const ExpensesModal: React.FC<ExpensesModalProps> = ({ 
  currentPurchases, 
  archivedHistory,
  onAddInvoice, 
  onDeleteInvoice,
  isOpen,
  onClose,
  suppliers = [],
  onAddSupplier,
  onDeleteSupplier
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('new');
  
  // -- New Invoice State --
  const [supplierName, setSupplierName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid'); 
  const [itemInputs, setItemInputs] = useState({ name: '', quantity: '', cost: '' });
  const [currentInvoiceItems, setCurrentInvoiceItems] = useState<PurchaseItem[]>([]);

  // -- Printing State --
  const [invoiceToPrint, setInvoiceToPrint] = useState<PurchaseInvoice | null>(null);

  // -- History View State --
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  const addItemToInvoice = () => {
      if (!itemInputs.name || !itemInputs.quantity || !itemInputs.cost) return;
      const qty = parseFloat(itemInputs.quantity);
      const cost = parseFloat(itemInputs.cost);
      
      const newItem: PurchaseItem = {
          id: Date.now().toString(),
          name: itemInputs.name,
          quantity: qty,
          cost: cost,
          total: qty * cost
      };

      setCurrentInvoiceItems(prev => [...prev, newItem]);
      setItemInputs({ name: '', quantity: '', cost: '' }); 
  };

  const removeItemFromInvoice = (itemId: string) => {
      setCurrentInvoiceItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSaveInvoice = () => {
      if (!supplierName || currentInvoiceItems.length === 0) {
          alert('يرجى إدخال اسم المورد وإضافة مادة واحدة على الأقل.');
          return;
      }

      const totalAmount = currentInvoiceItems.reduce((sum, item) => sum + item.total, 0);
      const newInvoice: PurchaseInvoice = {
          id: Date.now().toString(),
          supplierName,
          date: new Date().toLocaleDateString('en-GB'),
          timestamp: Date.now(),
          items: currentInvoiceItems,
          totalAmount,
          paymentStatus
      };

      onAddInvoice(newInvoice);
      
      setSupplierName('');
      setCurrentInvoiceItems([]);
      setPaymentStatus('paid');
      alert('تم حفظ فاتورة المشتريات بنجاح');
  };

  const handleSaveSupplier = () => {
      if (!supplierName || !onAddSupplier) return;
      // Check if exists
      if (suppliers.some(s => s.name === supplierName)) {
          alert('هذا المورد موجود بالفعل');
          return;
      }
      onAddSupplier({ name: supplierName });
      alert('تم حفظ المورد في القائمة');
  };

  // --- Logic: Grouping History Data ---
  const allInvoices = useMemo(() => {
      let all: PurchaseInvoice[] = [...currentPurchases];
      archivedHistory.forEach(day => {
          if (day.purchaseInvoices) {
              all = [...all, ...day.purchaseInvoices];
          }
      });
      return all.sort((a, b) => b.timestamp - a.timestamp); 
  }, [currentPurchases, archivedHistory]);

  const years = useMemo(() => Array.from(new Set(allInvoices.map(inv => new Date(inv.timestamp).getFullYear().toString()))), [allInvoices]);
  
  const filteredInvoices = useMemo(() => {
      return allInvoices.filter(inv => {
          const d = new Date(inv.timestamp);
          const y = d.getFullYear().toString();
          const m = (d.getMonth() + 1).toString();
          
          if (selectedYear !== 'All' && y !== selectedYear) return false;
          if (selectedMonth !== 'All' && m !== selectedMonth) return false;
          return true;
      });
  }, [allInvoices, selectedYear, selectedMonth]);

  const getMonthName = (m: number) => new Date(2000, m - 1).toLocaleString('ar-SY', { month: 'long' });

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-700 animate-fade-up flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={20} className="text-red-400" />
            <h3 className="font-bold text-lg">إدارة المشتريات والموردين</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-700/20">
            <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-[#FA8072] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
                <Plus size={16} />
                فاتورة شراء جديدة
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-[#FA8072] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
                <Folder size={16} />
                أرشيف الفواتير
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-900/30">
          
          {/* === TAB 1: NEW INVOICE === */}
          {activeTab === 'new' && (
              <div className="space-y-6 animate-fade-up">
                  {/* Supplier Info & Payment Status */}
                  <div className="flex flex-col md:flex-row gap-4">
                      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-grow">
                          <div className="flex justify-between items-center mb-1">
                             <label className="text-xs text-gray-400 block">اسم المورد / المصدر</label>
                             {onAddSupplier && (
                                 <button onClick={handleSaveSupplier} className="text-[10px] text-[#FA8072] hover:underline flex items-center gap-1">
                                     <UserPlus size={10} />
                                     حفظ المورد في القائمة
                                 </button>
                             )}
                          </div>
                          
                          <div className="flex gap-2">
                             <div className="relative flex-grow">
                                <input 
                                    list="suppliers-list"
                                    type="text" 
                                    value={supplierName}
                                    onChange={e => setSupplierName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-red-400"
                                    placeholder="اختر او اكتب اسم المورد..."
                                />
                                <datalist id="suppliers-list">
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.name} />
                                    ))}
                                </datalist>
                             </div>
                          </div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 min-w-[200px]">
                          <label className="text-xs text-gray-400 mb-2 block">حالة الدفع</label>
                          <div className="flex bg-gray-900 p-1 rounded-lg">
                              <button 
                                onClick={() => setPaymentStatus('paid')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1 ${paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                              >
                                  <CheckCircle size={12} />
                                  مدفوع (نقدي)
                              </button>
                              <button 
                                onClick={() => setPaymentStatus('credit')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1 ${paymentStatus === 'credit' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                              >
                                  <Clock size={12} />
                                  آجل (ذمم)
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Item Entry */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <Plus size={16} className="text-red-400" />
                          إضافة أصناف للفاتورة
                      </h4>
                      <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-5">
                              <input 
                                  type="text" 
                                  value={itemInputs.name}
                                  onChange={e => setItemInputs({...itemInputs, name: e.target.value})}
                                  placeholder="اسم الصنف (طحين، سكر...)"
                                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-red-400"
                              />
                          </div>
                          <div className="col-span-3">
                              <input 
                                  type="number" 
                                  value={itemInputs.quantity}
                                  onChange={e => setItemInputs({...itemInputs, quantity: e.target.value})}
                                  placeholder="الكمية"
                                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-red-400 text-center"
                              />
                          </div>
                          <div className="col-span-3">
                               <input 
                                  type="number" 
                                  value={itemInputs.cost}
                                  onChange={e => setItemInputs({...itemInputs, cost: e.target.value})}
                                  placeholder="السعر"
                                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-red-400 text-center"
                              />
                          </div>
                          <div className="col-span-1">
                              <button 
                                  onClick={addItemToInvoice}
                                  className="w-full h-full bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors"
                              >
                                  <Plus size={18} />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Items List Table */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden min-h-[150px]">
                      <table className="w-full text-sm text-right">
                          <thead className="bg-gray-900 text-gray-400 text-xs">
                              <tr>
                                  <th className="p-3">المادة</th>
                                  <th className="p-3 text-center">الكمية</th>
                                  <th className="p-3">السعر</th>
                                  <th className="p-3">الإجمالي</th>
                                  <th className="p-3 w-10"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                              {currentInvoiceItems.length === 0 ? (
                                  <tr>
                                      <td colSpan={5} className="text-center py-8 text-gray-500">لم يتم إضافة أصناف بعد</td>
                                  </tr>
                              ) : (
                                  currentInvoiceItems.map(item => (
                                      <tr key={item.id} className="hover:bg-gray-700/50">
                                          <td className="p-3 text-white">{item.name}</td>
                                          <td className="p-3 text-center text-gray-300">{item.quantity}</td>
                                          <td className="p-3 text-gray-300">{item.cost.toLocaleString('en-US')}</td>
                                          <td className="p-3 font-bold text-red-400">{item.total.toLocaleString('en-US')}</td>
                                          <td className="p-3">
                                              <button onClick={() => removeItemFromInvoice(item.id)} className="text-gray-500 hover:text-red-500">
                                                  <Trash2 size={14} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
                  
                  {/* Footer Total */}
                  <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <div>
                          <p className="text-gray-400 text-xs">إجمالي الفاتورة</p>
                          <h3 className="text-2xl font-bold text-red-400">
                              {currentInvoiceItems.reduce((sum, i) => sum + i.total, 0).toLocaleString('en-US')} <span className="text-sm">ل.س</span>
                          </h3>
                      </div>
                      <button 
                          onClick={handleSaveInvoice}
                          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                      >
                          <FileText size={18} />
                          حفظ الفاتورة
                      </button>
                  </div>
              </div>
          )}

          {/* === TAB 2: HISTORY === */}
          {activeTab === 'history' && (
              <div className="space-y-4 animate-fade-up">
                  
                  {/* Filters */}
                  <div className="flex gap-2 bg-gray-800 p-3 rounded-xl border border-gray-700">
                      <div className="flex-1">
                          <select 
                              value={selectedYear} 
                              onChange={(e) => setSelectedYear(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none"
                          >
                              <option value="All">كل السنوات</option>
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                      </div>
                      <div className="flex-1">
                          <select 
                              value={selectedMonth} 
                              onChange={(e) => setSelectedMonth(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm outline-none"
                          >
                              <option value="All">كل الأشهر</option>
                              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                  <option key={m} value={m}>{m} - {getMonthName(m)}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                      {filteredInvoices.length === 0 ? (
                          <div className="text-center py-10 text-gray-500">لا توجد فواتير مطابقة للتصفية.</div>
                      ) : (
                          filteredInvoices.map(invoice => (
                              <div key={invoice.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group">
                                  <div className="p-4 flex items-center justify-between bg-gray-800 hover:bg-gray-700/50 transition-colors">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-white text-lg">{invoice.supplierName}</span>
                                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md border border-gray-600">{invoice.date}</span>
                                              
                                              {/* Payment Status Badge */}
                                              {invoice.paymentStatus === 'credit' ? (
                                                <span className="text-[10px] bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-md border border-orange-700/50 flex items-center gap-1 font-bold">
                                                    <Clock size={10} />
                                                    آجل (ذمم)
                                                </span>
                                              ) : (
                                                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-md border border-green-700/50 flex items-center gap-1 font-bold">
                                                    <CheckCircle size={10} />
                                                    مدفوع
                                                </span>
                                              )}
                                          </div>
                                          <p className="text-xs text-gray-500">{invoice.items.length} صنف</p>
                                      </div>
                                      <div className="text-left flex items-center gap-3">
                                           <div className="font-bold text-red-400 text-lg">{invoice.totalAmount.toLocaleString('en-US')} ل.س</div>
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); setInvoiceToPrint(invoice); }}
                                                className="bg-gray-700 hover:bg-[#FA8072] text-white p-2 rounded-lg transition-colors shadow-sm"
                                                title="طباعة PDF"
                                            >
                                                <Printer size={16} />
                                            </button>
                                           {currentPurchases.find(p => p.id === invoice.id) && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteInvoice(invoice.id); }}
                                                    className="text-gray-600 hover:text-red-500 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                           )}
                                      </div>
                                  </div>
                                  
                                  {/* Expanded details (simple view) */}
                                  <div className="bg-gray-900/50 p-3 border-t border-gray-700">
                                      <table className="w-full text-xs text-right text-gray-400">
                                          <thead>
                                              <tr className="border-b border-gray-700/50">
                                                  <th className="pb-1">المادة</th>
                                                  <th className="pb-1">الكمية</th>
                                                  <th className="pb-1">السعر</th>
                                                  <th className="pb-1">الإجمالي</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-800">
                                              {invoice.items.map(item => (
                                                  <tr key={item.id}>
                                                      <td className="py-1 text-gray-300">{item.name}</td>
                                                      <td className="py-1">{item.quantity}</td>
                                                      <td className="py-1">{item.cost.toLocaleString('en-US')}</td>
                                                      <td className="py-1 text-red-400">{item.total.toLocaleString('en-US')}</td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Print Modal */}
    {invoiceToPrint && (
        <Suspense fallback={null}>
            <PurchasePrintModal 
                invoice={invoiceToPrint} 
                onClose={() => setInvoiceToPrint(null)} 
            />
        </Suspense>
    )}
    </>
  );
};