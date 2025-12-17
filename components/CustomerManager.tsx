import React, { useState } from 'react';
import { Plus, Trash2, X, Users, Phone } from 'lucide-react';
import { Customer } from '../types';

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onDeleteCustomer: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ 
  customers, 
  onAddCustomer, 
  onDeleteCustomer,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCustomer({ name, phone });
    setName('');
    setPhone('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700 animate-fade-up flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Users size={20} className="text-[#FA8072]" />
            <h3 className="font-bold text-lg">إدارة العملاء (الجملة)</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-700/30 p-4 rounded-xl border border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-3">إضافة عميل جديد</h4>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسم العميل"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-[#FA8072] outline-none text-sm"
                    required
                />
                <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="رقم الهاتف (اختياري)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-[#FA8072] outline-none text-sm dir-ltr text-right"
                />
                <button 
                    type="submit"
                    className="w-full bg-[#FA8072] hover:bg-[#e67365] text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-bold mt-1 shadow-lg"
                >
                    <Plus size={18} />
                    <span>إضافة</span>
                </button>
            </div>
          </form>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-400 mb-2">قائمة العملاء ({customers.length})</h4>
            {customers.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">لا يوجد عملاء.</p>
            ) : (
              <div className="grid gap-2">
                {customers.map(cust => (
                  <div key={cust.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <div>
                      <div className="text-white font-medium">{cust.name}</div>
                      {cust.phone && (
                          <div className="text-gray-400 text-xs flex items-center gap-1">
                              <Phone size={10} />
                              {cust.phone}
                          </div>
                      )}
                    </div>
                    <button 
                      onClick={() => onDeleteCustomer(cust.id)}
                      className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};