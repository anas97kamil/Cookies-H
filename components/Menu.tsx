import React, { useState, useMemo } from 'react';
import { Trash2, ShoppingBag, Search, User, Download, Store } from 'lucide-react';
import { SaleItem } from '../types';

interface SalesTableProps {
  items: SaleItem[];
  onDeleteItem: (id: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onPreviewInvoice: (items: SaleItem[]) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ items, onDeleteItem, onDeleteOrder, onPreviewInvoice }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for inline deletion confirmation
  const [confirmItemId, setConfirmItemId] = useState<string | null>(null);
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null);
  
  // Group items by orderId
  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: SaleItem[] } = {};
    items.forEach(item => {
        const key = item.orderId || `legacy-${item.time}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
    });
    
    // Convert to array and sort by time (newest first)
    return Object.values(groups).sort((a, b) => {
        const timeA = a[0]?.id ? 1 : 0; // Simple check, ideally parse timestamp
        return 0; // Keeping original sort order (newest usually appended, so we might want to reverse in UI)
    }).reverse();
  }, [items]);

  // Filter logic for Search
  const filteredOrders = useMemo(() => {
      if (!searchTerm) return groupedOrders;
      const lowerTerm = searchTerm.toLowerCase();
      return groupedOrders.filter(group => {
          const first = group[0];
          const name = first.customerName?.toLowerCase() || '';
          const number = first.customerNumber.toString();
          return name.includes(lowerTerm) || number.includes(lowerTerm);
      });
  }, [groupedOrders, searchTerm]);

  if (items.length === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-700 text-center flex flex-col items-center justify-center min-h-[200px] print:hidden">
        <div className="bg-gray-700 p-4 rounded-full mb-3">
            <ShoppingBag className="text-gray-400 w-8 h-8" />
        </div>
        <p className="text-gray-400 font-medium">لا توجد مبيعات مسجلة اليوم حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {/* Search Bar */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center gap-4 no-print">
            <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث عن فاتورة (اسم الزبون أو رقمه)..."
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pr-10 pl-4 py-2 outline-none focus:border-[#FA8072]"
                />
            </div>
            
            <div className="text-gray-400 text-xs">
                عدد الفواتير المعروضة: {filteredOrders.length}
            </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
            {filteredOrders.map((group, index) => {
                const firstItem = group[0];
                const orderTotal = group.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const orderId = firstItem.orderId;
                const displayName = firstItem.customerName ? `${firstItem.customerName}` : `زبون رقم ${firstItem.customerNumber || '?'}`;
                const isWholesale = firstItem.saleType === 'wholesale';
                
                return (
                    <div key={orderId || index} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden animate-fade-up">
                        {/* Order Header */}
                        <div className="bg-gray-900/50 p-4 flex flex-wrap items-center justify-between border-b border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-lg font-bold border flex items-center gap-2 ${isWholesale ? 'bg-orange-900/20 text-orange-400 border-orange-500/20' : 'bg-blue-900/20 text-blue-400 border-blue-500/20'}`}>
                                    {isWholesale ? <Store size={16} /> : <User size={16} />}
                                    <span>
                                        {displayName}
                                        {/* If name exists, show number in small text */}
                                        {firstItem.customerName && <span className="text-xs opacity-70 mr-2">#{firstItem.customerNumber}</span>}
                                    </span>
                                </div>
                                <span className="text-gray-400 text-sm font-mono">{firstItem.time}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <div className="text-white font-bold">
                                    <span className="text-gray-400 text-sm font-normal ml-2">الإجمالي:</span>
                                    {orderTotal.toLocaleString('en-US')} ل.س
                                </div>
                                
                                {/* Download Invoice Button */}
                                <button 
                                    onClick={() => onPreviewInvoice(group)}
                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors no-print ml-2"
                                    title="تحميل الفاتورة PDF"
                                >
                                    <Download size={14} />
                                    تحميل PDF
                                </button>

                                {onDeleteOrder && (
                                    confirmOrderId === orderId ? (
                                        <div className="flex items-center gap-2 no-print">
                                            <span className="text-xs text-red-300 hidden md:inline">حذف؟</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteOrder(orderId);
                                                    setConfirmOrderId(null);
                                                }}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                            >
                                                نعم
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmOrderId(null);
                                                }}
                                                className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmOrderId(orderId);
                                            }}
                                            className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors no-print"
                                            title="حذف الطلب بالكامل"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-700/20 text-xs text-gray-400">
                                    <tr>
                                        <th className="py-2 px-4">المادة</th>
                                        <th className="py-2 px-4 text-center">الكمية</th>
                                        <th className="py-2 px-4">السعر</th>
                                        <th className="py-2 px-4">الإجمالي</th>
                                        <th className="py-2 px-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50 text-sm">
                                    {group.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="py-2 px-4 font-medium text-gray-200">
                                                {item.name}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">
                                                    {item.quantity} {item.unitType === 'kg' ? 'كغ' : 'قطعة'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 text-gray-400">{item.price.toLocaleString('en-US')}</td>
                                            <td className="py-2 px-4 text-[#FA8072] font-medium">
                                                {(item.price * item.quantity).toLocaleString('en-US')}
                                            </td>
                                            <td className="py-2 px-4 text-left">
                                                {confirmItemId === item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                onDeleteItem(item.id);
                                                                setConfirmItemId(null);
                                                            }}
                                                            className="text-red-500 text-xs font-bold hover:underline"
                                                        >
                                                            تأكيد
                                                        </button>
                                                        <span className="text-gray-600">/</span>
                                                        <button
                                                            onClick={() => setConfirmItemId(null)}
                                                            className="text-gray-400 text-xs hover:text-white"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmItemId(item.id);
                                                        }}
                                                        className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                                                        title="حذف مادة"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};