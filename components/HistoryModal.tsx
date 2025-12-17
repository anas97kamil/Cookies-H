import React, { useState, useMemo } from 'react';
import { X, Calendar, ChevronDown, ChevronUp, Download, Store, User, Search, Receipt, Package, ArrowRight, Folder, CalendarDays, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { ArchivedDay, SaleItem } from '../types';

interface HistoryModalProps {
  history: ArchivedDay[];
  onClose: () => void;
  onClearHistory: () => void;
  onPreviewInvoice: (items: SaleItem[]) => void;
}

// Navigation Steps
type NavStep = 'years' | 'months' | 'days';
type ViewMode = 'invoices' | 'items';

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onClearHistory, onPreviewInvoice }) => {
  // Navigation State
  const [step, setStep] = useState<NavStep>('years');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Details State
  const [viewMode, setViewMode] = useState<ViewMode>('invoices');
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  // --- SEARCH LOGIC (GLOBAL) ---
  const searchResults = useMemo(() => {
      if (!searchTerm) return null;
      const lowerTerm = searchTerm.toLowerCase();

      // Flatten everything into invoices
      const allInvoices: { date: string; items: SaleItem[]; total: number; customerName: string; saleType: string }[] = [];

      history.forEach(day => {
          const dayGroups: { [key: string]: SaleItem[] } = {};
          day.items.forEach(item => {
              const key = item.orderId || `legacy-${item.time}`;
              if (!dayGroups[key]) dayGroups[key] = [];
              dayGroups[key].push(item);
          });

          Object.values(dayGroups).forEach(group => {
              const first = group[0];
              const name = first.customerName || `زبون ${first.customerNumber}`;
              // Search by Name or ID
              if (name.toLowerCase().includes(lowerTerm) || first.customerNumber.toString().includes(lowerTerm)) {
                  allInvoices.push({
                      date: day.date,
                      items: group,
                      total: group.reduce((sum, i) => sum + i.price * i.quantity, 0),
                      customerName: name,
                      saleType: first.saleType
                  });
              }
          });
      });

      return allInvoices;
  }, [history, searchTerm]);

  // --- DATA HELPERS (Navigation) ---

  // 1. Get Available Years
  const years = useMemo(() => {
    const uniqueYears = new Set<string>(history.map(day => new Date(day.timestamp).getFullYear().toString()));
    return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a));
  }, [history]);

  // 2. Get Available Months for Selected Year
  const months = useMemo(() => {
    if (!selectedYear) return [];
    const uniqueMonths = new Set<number>(
      history
        .filter(day => new Date(day.timestamp).getFullYear().toString() === selectedYear)
        .map(day => new Date(day.timestamp).getMonth())
    );
    return Array.from(uniqueMonths).sort((a, b) => b - a);
  }, [history, selectedYear]);

  // 3. Get Days for Selected Year & Month
  const currentDaysData = useMemo(() => {
    if (!selectedYear || selectedMonth === -1) return [];
    return history.filter(day => {
      const d = new Date(day.timestamp);
      return d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [history, selectedYear, selectedMonth]);

  // 4. Aggregated Items Logic (For Items View in Step 3)
  const aggregatedItems = useMemo(() => {
      const itemMap = new Map<string, { name: string; quantity: number; revenue: number; unitType: string }>();

      currentDaysData.forEach(day => {
          day.items.forEach(item => {
              const key = `${item.name}-${item.unitType}`;
              const existing = itemMap.get(key);
              if (existing) {
                  existing.quantity += item.quantity;
                  existing.revenue += (item.price * item.quantity);
              } else {
                  itemMap.set(key, {
                      name: item.name,
                      quantity: item.quantity,
                      revenue: item.price * item.quantity,
                      unitType: item.unitType
                  });
              }
          });
      });

      return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [currentDaysData]);

  const totalRevenueForPeriod = currentDaysData.reduce((sum, day) => sum + day.totalRevenue, 0);

  // --- HANDLERS ---

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setStep('months');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setStep('days');
  };

  const handleBack = () => {
    if (step === 'days') {
        setStep('months');
        setSelectedMonth(-1);
    } else if (step === 'months') {
        setStep('years');
        setSelectedYear('');
    }
  };

  const getMonthName = (monthIndex: number) => {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString('ar-SY', { month: 'long' });
  };

  // Helper to group items in a day by OrderID (Invoice)
  const getDayInvoices = (items: SaleItem[]) => {
      const groups: { [key: string]: SaleItem[] } = {};
      items.forEach(item => {
          const key = item.orderId || `legacy-${item.time}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      return Object.values(groups).reverse(); 
  };

  // --- RENDER CONTENT BASED ON STEP ---

  const renderContent = () => {
    // 0. SEARCH RESULTS MODE
    if (searchTerm) {
        if (!searchResults || searchResults.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search size={48} className="mb-4 opacity-50" />
                    <p>لا توجد نتائج مطابقة لـ "{searchTerm}"</p>
                </div>
            );
        }

        const totalSearchRevenue = searchResults.reduce((acc, curr) => acc + curr.total, 0);

        return (
            <div className="animate-fade-up space-y-4">
                 {/* Summary Card for Search */}
                 <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex justify-between items-center">
                    <div>
                        <h4 className="text-white font-bold text-sm">نتائج البحث عن: "{searchTerm}"</h4>
                        <p className="text-gray-400 text-xs mt-1">تم العثور على {searchResults.length} فاتورة</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs text-gray-400">إجمالي المبلغ</span>
                        <span className="block font-bold text-[#FA8072] text-xl">{totalSearchRevenue.toLocaleString('en-US')} ل.س</span>
                    </div>
                 </div>

                 {/* Results List */}
                 <div className="space-y-3">
                    {searchResults.map((inv, idx) => (
                         <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                             <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <div className={`p-1 rounded-md ${inv.saleType === 'wholesale' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {inv.saleType === 'wholesale' ? <Store size={14} /> : <User size={14} />}
                                        </div>
                                        <span className="font-bold text-white">{inv.customerName}</span>
                                     </div>
                                     <span className="text-xs text-gray-500">{inv.date} - {inv.items[0].time}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <span className="font-bold text-[#FA8072]">{inv.total.toLocaleString('en-US')} ل.س</span>
                                     <button 
                                        onClick={() => onPreviewInvoice(inv.items)}
                                        className="bg-gray-700 hover:bg-white hover:text-black text-white p-1.5 rounded-lg transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                 </div>
                             </div>
                             
                             {/* Items Preview */}
                             <div className="text-xs text-gray-400">
                                 {inv.items.map((i, k) => (
                                     <span key={k} className="inline-block bg-gray-900 px-2 py-1 rounded mr-1 mb-1 border border-gray-700">
                                         {i.name} ({i.quantity})
                                     </span>
                                 ))}
                             </div>
                         </div>
                    ))}
                 </div>
            </div>
        );
    }

    // STEP 1: YEARS
    if (step === 'years') {
        if (years.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Search size={48} className="mb-4 opacity-50" />
                    <p>لا توجد سجلات محفوظة.</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up">
                {years.map(year => (
                    <button 
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-[#FA8072] text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <Folder size={40} className="text-[#FA8072] group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold">{year}</span>
                        <span className="text-xs text-gray-400">سنة مالية</span>
                    </button>
                ))}
            </div>
        );
    }

    // STEP 2: MONTHS
    if (step === 'months') {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up">
                {months.map(monthIdx => (
                    <button 
                        key={monthIdx}
                        onClick={() => handleMonthSelect(monthIdx)}
                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-[#FA8072] text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <CalendarDays size={40} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold">{getMonthName(monthIdx)}</span>
                        <span className="text-xs text-gray-400">{selectedYear}</span>
                    </button>
                ))}
            </div>
        );
    }

    // STEP 3: DAYS (DETAILS)
    if (step === 'days') {
        return (
            <div className="flex flex-col gap-4 animate-fade-up h-full">
                {/* Toggle View Mode */}
                 <div className="flex bg-gray-700 p-1 rounded-xl shrink-0">
                    <button 
                        onClick={() => setViewMode('invoices')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'invoices' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Receipt size={16} />
                        عرض الفواتير (يومي)
                    </button>
                    <button 
                        onClick={() => setViewMode('items')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'items' ? 'bg-[#FA8072] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Package size={16} />
                        تجميع المواد (شهري)
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 bg-gray-900/30 rounded-xl border border-gray-700/50 p-2">
                     {currentDaysData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">لا توجد بيانات لهذا الشهر.</div>
                     ) : (
                        <>
                            {viewMode === 'invoices' ? (
                                // MODE A: LIST OF DAYS WITH INVOICES
                                <div className="space-y-3">
                                    {currentDaysData.map((day) => {
                                        const dayExpense = day.totalExpenses || 0;
                                        const dayNet = day.totalRevenue - dayExpense;

                                        return (
                                        <div key={day.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all">
                                            <div 
                                                onClick={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                                                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-gray-700/30 gap-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${expandedDayId === day.id ? 'bg-[#FA8072] text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                        {expandedDayId === day.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-lg">{day.date}</div>
                                                        <div className="text-xs text-gray-400">{day.totalItems} قطعة مباعة</div>
                                                    </div>
                                                </div>
                                                
                                                {/* Financial Summary for the Day */}
                                                <div className="flex items-center gap-4 text-sm w-full md:w-auto justify-between md:justify-end bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><TrendingUp size={10} /> مبيعات</span>
                                                        <span className="font-bold text-green-400">{day.totalRevenue.toLocaleString('en-US')}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-gray-700"></div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><TrendingDown size={10} /> مصاريف</span>
                                                        <span className="font-bold text-red-400">{dayExpense.toLocaleString('en-US')}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-gray-700"></div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><Wallet size={10} /> صافي</span>
                                                        <span className={`font-bold ${dayNet >= 0 ? 'text-[#FA8072]' : 'text-red-500'}`}>{dayNet.toLocaleString('en-US')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedDayId === day.id && (
                                                <div className="bg-gray-900/50 border-t border-gray-700 p-3 space-y-3 animate-fade-up">
                                                    {/* Show Purchase Invoices List if any */}
                                                    {day.purchaseInvoices && day.purchaseInvoices.length > 0 && (
                                                        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-3 mb-2">
                                                            <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1"><TrendingDown size={12} /> فواتير المشتريات</h5>
                                                            <div className="space-y-2">
                                                                {day.purchaseInvoices.map((inv) => (
                                                                    <div key={inv.id} className="bg-gray-800/50 p-2 rounded border border-red-900/20">
                                                                        <div className="flex justify-between text-xs text-gray-200 mb-1">
                                                                            <span className="font-bold">- {inv.supplierName}</span>
                                                                            <span className="font-bold text-red-300">{inv.totalAmount.toLocaleString('en-US')}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-400 pr-2">
                                                                            {inv.items.map((item, idx) => (
                                                                                <span key={idx} className="ml-2">
                                                                                    {item.name} ({item.quantity})
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {getDayInvoices(day.items).map((invoice, idx) => {
                                                        const first = invoice[0];
                                                        const total = invoice.reduce((s, i) => s + (i.price * i.quantity), 0);
                                                        const isWholesale = first.saleType === 'wholesale';
                                                        return (
                                                            <div key={idx} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`p-1.5 rounded-md ${isWholesale ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                            {isWholesale ? <Store size={14} /> : <User size={14} />}
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-sm font-bold text-white">
                                                                                {first.customerName || `زبون #${first.customerNumber}`}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500 font-mono">{first.time}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-[#FA8072] text-sm">{total.toLocaleString('en-US')} ل.س</span>
                                                                        <button 
                                                                            onClick={() => onPreviewInvoice(invoice)}
                                                                            className="bg-gray-700 hover:bg-white hover:text-black text-white p-1.5 rounded-lg transition-colors"
                                                                            title="تحميل PDF"
                                                                        >
                                                                            <Download size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <table className="w-full text-xs text-right text-gray-400">
                                                                    <tbody>
                                                                        {invoice.map((item, i) => (
                                                                            <tr key={i} className="border-t border-gray-700/50">
                                                                                <td className="py-1">{item.name}</td>
                                                                                <td className="py-1 text-center">{item.quantity}</td>
                                                                                <td className="py-1 text-[#FA8072]">{item.price * item.quantity}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            ) : (
                                // MODE B: AGGREGATED ITEMS
                                <div className="animate-fade-up">
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                        <div className="p-4 border-b border-gray-700 bg-gray-700/30 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white">إجمالي شهر {getMonthName(selectedMonth)}</h4>
                                                <p className="text-xs text-gray-400">{selectedYear}</p>
                                            </div>
                                            <div className="text-[#FA8072] font-bold text-xl">{totalRevenueForPeriod.toLocaleString('en-US')} ل.س</div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-right">
                                                <thead className="bg-gray-900 text-gray-400 text-xs">
                                                    <tr>
                                                        <th className="p-3">المادة</th>
                                                        <th className="p-3 text-center">الكمية</th>
                                                        <th className="p-3">الإيراد</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {aggregatedItems.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-700/50">
                                                            <td className="p-3 font-medium text-white">{item.name}</td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2 py-1 rounded text-xs ${item.unitType === 'kg' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                    {item.quantity.toLocaleString('en-US')} {item.unitType === 'kg' ? 'كغ' : 'قطعة'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-[#FA8072] font-bold">{item.revenue.toLocaleString('en-US')} ل.س</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                     )}
                </div>
            </div>
        );
    }
  };

  // --- HEADER TEXT HELPER ---
  const getHeaderText = () => {
    if (searchTerm) return 'نتائج البحث';
    if (step === 'years') return 'اختيار السنة';
    if (step === 'months') return `سنة ${selectedYear} - اختيار الشهر`;
    if (step === 'days') return `${getMonthName(selectedMonth)} ${selectedYear}`;
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-700 animate-fade-up flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-900/50 rounded-t-2xl shrink-0 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                    {/* BACK BUTTON LOGIC */}
                    {!searchTerm && step !== 'years' ? (
                        <button 
                            onClick={handleBack}
                            className="bg-gray-700 hover:bg-[#FA8072] text-white p-2 rounded-full transition-colors"
                            title="رجوع للخلف"
                        >
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <div className="bg-[#FA8072]/20 p-2 rounded-lg text-[#FA8072]">
                            {searchTerm ? <Search size={22} /> : <Calendar size={22} />}
                        </div>
                    )}
                    
                    <div>
                        <h3 className="font-bold text-lg">{getHeaderText()}</h3>
                        {!searchTerm && step === 'years' && <p className="text-xs text-gray-400">سجل المبيعات (الأرشيف)</p>}
                    </div>
                </div>

                <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث عن زبون في الأرشيف لمعرفة مجموع حساباته..."
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pr-10 pl-4 py-2.5 outline-none focus:border-[#FA8072] focus:ring-1 focus:ring-[#FA8072] placeholder:text-gray-600 transition-all text-sm"
                />
            </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-gray-900/20">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};