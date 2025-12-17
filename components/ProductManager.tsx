import React, { useState } from 'react';
import { Plus, Trash2, Settings, X, Scale, Box } from 'lucide-react';
import { Product, UnitType } from '../types';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  onAddProduct, 
  onDeleteProduct,
  isOpen,
  onClose
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('piece');
  
  // State to track which product is being deleted
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    onAddProduct({
      name,
      price: parseFloat(price),
      unitType
    });

    setName('');
    setPrice('');
    setUnitType('piece'); // Reset to default
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-700 animate-fade-up flex flex-col max-h-[85vh]">
        
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Settings size={20} className="text-[#FA8072]" />
            <h3 className="font-bold text-lg">إدارة المواد والأسعار</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Add New Product Form */}
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-700/30 p-4 rounded-xl border border-gray-600">
            <h4 className="text-sm font-bold text-gray-300 mb-3">إضافة مادة جديدة للقائمة</h4>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسم المادة (مثال: كوكيز فانيلا)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-[#FA8072] outline-none text-sm"
                    required
                />
                
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="السعر"
                        className="flex-grow px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-1 focus:ring-[#FA8072] outline-none text-sm"
                        required
                    />

                     {/* Unit Type Selector */}
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-600 shrink-0">
                        <button
                            type="button"
                            onClick={() => setUnitType('piece')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors ${unitType === 'piece' ? 'bg-[#FA8072] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Box size={14} />
                            قطعة
                        </button>
                        <button
                            type="button"
                            onClick={() => setUnitType('kg')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors ${unitType === 'kg' ? 'bg-[#FA8072] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Scale size={14} />
                            كيلو
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-[#FA8072] hover:bg-[#e67365] text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-bold mt-1 shadow-lg shadow-[#FA8072]/20"
                >
                    <Plus size={18} />
                    <span>إضافة المادة</span>
                </button>
            </div>
          </form>

          {/* Product List */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-400 mb-2">قائمة المواد الحالية ({products.length})</h4>
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">لا توجد مواد مضافة بعد.</p>
            ) : (
              <div className="grid gap-2">
                {products.map(product => (
                  <div key={product.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <div>
                      <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{product.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded text-black font-bold ${product.unitType === 'kg' ? 'bg-yellow-400' : 'bg-blue-300'}`}>
                              {product.unitType === 'kg' ? 'كيلو' : 'قطعة'}
                          </span>
                      </div>
                      <span className="text-[#FA8072] text-sm font-bold">{product.price.toLocaleString('en-US')} ل.س</span>
                    </div>
                    
                    {/* Delete Action with Confirmation */}
                    {confirmDeleteId === product.id ? (
                        <div className="flex items-center gap-2 animate-fade-up">
                            <span className="text-xs text-red-300">حذف؟</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProduct(product.id);
                                    setConfirmDeleteId(null);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                            >
                                نعم
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                }}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                                لا
                            </button>
                        </div>
                    ) : (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmDeleteId(product.id);
                          }}
                          className="text-gray-400 hover:text-red-400 p-2 transition-colors cursor-pointer"
                          title="حذف من القائمة"
                        >
                          <Trash2 size={18} />
                        </button>
                    )}
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