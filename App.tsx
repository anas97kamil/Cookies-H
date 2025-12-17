import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { POSInterface } from './components/RecipeGenerator';
import { SalesTable } from './components/Menu';
import { Summary } from './components/InfoBox';
import { Login } from './components/Login';
import { SaleItem, Product, ArchivedDay, SaleType, Customer, PurchaseInvoice, Supplier } from './types';
import { Save, RotateCcw, X, Loader2 } from 'lucide-react';

const InvoiceModal = React.lazy(() => import('./components/InvoiceModal').then(module => ({ default: module.InvoiceModal })));
const ProductManager = React.lazy(() => import('./components/ProductManager').then(module => ({ default: module.ProductManager })));
const HistoryModal = React.lazy(() => import('./components/HistoryModal').then(module => ({ default: module.HistoryModal })));
const DataManagementModal = React.lazy(() => import('./components/DataManagementModal').then(module => ({ default: module.DataManagementModal })));
const CustomerManager = React.lazy(() => import('./components/CustomerManager').then(module => ({ default: module.CustomerManager })));
const ExpensesModal = React.lazy(() => import('./components/ExpensesModal').then(module => ({ default: module.ExpensesModal })));

const DEFAULT_PRODUCTS: Product[] = [];

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const intervalId = setInterval(() => {
      if (navigator.onLine !== isOnline) setIsOnline(navigator.onLine);
    }, 2000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);
  return isOnline;
};

const ModalLoader = () => (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gray-800 p-4 rounded-full shadow-xl border border-gray-700">
            <Loader2 className="animate-spin text-[#FA8072]" size={32} />
        </div>
    </div>
);

// New Component: Circular Percentage Loader
const LoadingScreen = ({ progress }: { progress: number }) => {
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
  
    return (
      <div className="fixed inset-0 bg-[#111827] z-[100] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
            {/* Background Circle */}
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
                <circle
                    stroke="#1F2937"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                    stroke="#FA8072"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    fill="transparent"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                {progress}%
            </div>
        </div>
        <div className="mt-8 text-center animate-pulse">
            <img src="/logo.png" className="w-16 h-16 object-contain mx-auto mb-4" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
            <h2 className="text-xl font-bold text-white mb-1">مخبز كوكيز</h2>
            <p className="text-gray-400 text-sm">جاري تحميل النظام...</p>
        </div>
      </div>
    );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('isAuth') === 'true');
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const isOnline = useOnlineStatus();
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Core Data State
  const [sales, setSales] = useState<SaleItem[]>(() => {
    const saved = localStorage.getItem('dailySales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
      const saved = localStorage.getItem('dailyPurchaseInvoices');
      return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<ArchivedDay[]>(() => {
    const saved = localStorage.getItem('salesHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
      const saved = localStorage.getItem('customers');
      return saved ? JSON.parse(saved) : [];
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
      const saved = localStorage.getItem('suppliers');
      return saved ? JSON.parse(saved) : [];
  });
  
  // UI State
  const [invoiceItems, setInvoiceItems] = useState<SaleItem[] | null>(null); // For Invoice Modal
  const [showProductManager, setShowProductManager] = useState(false);
  const [showCustomerManager, setShowCustomerManager] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);

  const [undoState, setUndoState] = useState<{ items: SaleItem[], timerId: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => {
        if (granted) console.log("Storage persistence granted");
      });
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setInstallPrompt(null);
  };

  const updateLastSync = () => setLastSyncTime(new Date());

  useEffect(() => { localStorage.setItem('dailySales', JSON.stringify(sales)); updateLastSync(); }, [sales]);
  useEffect(() => { localStorage.setItem('dailyPurchaseInvoices', JSON.stringify(purchaseInvoices)); updateLastSync(); }, [purchaseInvoices]);
  useEffect(() => { localStorage.setItem('salesHistory', JSON.stringify(history)); updateLastSync(); }, [history]);
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); updateLastSync(); }, [products]);
  useEffect(() => { localStorage.setItem('customers', JSON.stringify(customers)); updateLastSync(); }, [customers]);
  useEffect(() => { localStorage.setItem('suppliers', JSON.stringify(suppliers)); updateLastSync(); }, [suppliers]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      localStorage.setItem('dailySales', JSON.stringify(sales));
      localStorage.setItem('dailyPurchaseInvoices', JSON.stringify(purchaseInvoices));
      localStorage.setItem('salesHistory', JSON.stringify(history));
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('customers', JSON.stringify(customers));
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
      setLastSyncTime(new Date());
      setIsSyncing(false);
    }, 800);
  };

  const handleLogin = () => {
      // 1. Show Loader
      setIsAppLoading(true);
      setLoadingProgress(0);
      
      // 2. Simulate Loading Progress
      let currentProgress = 0;
      const interval = setInterval(() => {
          // Non-linear increment to make it feel natural
          const increment = Math.random() * 15;
          currentProgress += increment;
          
          if (currentProgress >= 100) {
              currentProgress = 100;
              clearInterval(interval);
              setLoadingProgress(100);
              
              // 3. Finish Loading
              setTimeout(() => {
                  sessionStorage.setItem('isAuth', 'true');
                  setIsAuthenticated(true);
                  setIsAppLoading(false);
              }, 600); // Small delay at 100%
          } else {
              setLoadingProgress(Math.floor(currentProgress));
          }
      }, 150);
  };

  const getNextCustomerNumber = () => {
      if (sales.length === 0) return 1;
      const maxNum = Math.max(...sales.map(s => s.customerNumber || 0));
      return maxNum + 1;
  };

  // Enhanced Order Completion
  const handleCompleteOrder = (
      newItems: Omit<SaleItem, 'id' | 'time' | 'customerNumber' | 'orderId'>[], 
      customerName?: string, 
      customerId?: string,
      saleType: SaleType = 'retail'
    ) => {
    // Force English numerals for time
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const orderId = Date.now().toString(); 
    const customerNumber = getNextCustomerNumber(); 

    const itemsWithIds: SaleItem[] = newItems.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9), 
        orderId,
        customerNumber,
        customerName: customerName || undefined,
        customerId,
        saleType,
        time: currentTime
    }));

    setSales(prev => [...prev, ...itemsWithIds]);
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = sales.find(item => String(item.id) === String(id));
    if (!itemToDelete) return;
    if (undoState?.timerId) clearTimeout(undoState.timerId);
    setSales(prev => prev.filter(item => String(item.id) !== String(id)));
    const timerId = setTimeout(() => setUndoState(null), 5000);
    setUndoState({ items: [itemToDelete], timerId });
  };

  const handleDeleteOrder = (orderId: string) => {
    const itemsToDelete = sales.filter(item => String(item.orderId) === String(orderId));
    if (itemsToDelete.length === 0) return;
    if (undoState?.timerId) clearTimeout(undoState.timerId);
    setSales(prev => prev.filter(item => String(item.orderId) !== String(orderId)));
    const timerId = setTimeout(() => setUndoState(null), 5000);
    setUndoState({ items: itemsToDelete, timerId });
  };

  const handleUndo = () => {
      if (!undoState) return;
      if (undoState.timerId) clearTimeout(undoState.timerId);
      setSales(prev => [...prev, ...undoState.items]);
      setUndoState(null);
  };

  // Purchase Invoices Logic
  const handleAddPurchaseInvoice = (newInvoice: PurchaseInvoice) => {
      setPurchaseInvoices(prev => [...prev, newInvoice]);
  };

  const handleDeletePurchaseInvoice = (id: string) => {
      setPurchaseInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const handleEndDay = () => {
    if (sales.length === 0 && purchaseInvoices.length === 0) { alert('لا توجد بيانات لترحيلها.'); return; }
    if (confirm('سيتم إغلاق اليوم وتفريغ المبيعات والمشتريات الحالية للأرشيف. هل أنت متأكد؟')) {
        const totalRevenue = sales.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalExpenses = purchaseInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalItems = sales.reduce((sum, item) => sum + item.quantity, 0);
        
        const daySummary: ArchivedDay = {
            id: Date.now().toString(),
            // Force English numerals for date
            date: new Date().toLocaleDateString('en-GB'),
            timestamp: Date.now(),
            totalRevenue,
            totalExpenses,
            totalItems,
            items: [...sales],
            purchaseInvoices: [...purchaseInvoices] // Store invoices in archive
        };
        setHistory(prev => [daySummary, ...prev]);
        setSales([]);
        setPurchaseInvoices([]);
        setUndoState(null);
        alert('تم إغلاق اليوم بنجاح.');
    }
  };

  // Product Handlers
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...newProduct, id: Date.now().toString() }]);
  };
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  // Customer Handlers
  const handleAddCustomer = (newCustomer: Omit<Customer, 'id'>) => {
      setCustomers(prev => [...prev, { ...newCustomer, id: Date.now().toString() }]);
  };
  const handleDeleteCustomer = (id: string) => {
      setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Supplier Handlers
  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id'>) => {
      setSuppliers(prev => [...prev, { ...newSupplier, id: Date.now().toString() }]);
  };
  const handleDeleteSupplier = (id: string) => {
      setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const handleExportData = () => {
    const data = { appVersion: '1.3', timestamp: Date.now(), sales, purchaseInvoices, history, products, customers, suppliers };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Filename with English numerals
    link.download = `cookies-bakery-backup-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              if (!data || typeof data !== 'object') throw new Error('Invalid file');
              if (Array.isArray(data.sales)) setSales(data.sales);
              if (Array.isArray(data.purchaseInvoices)) setPurchaseInvoices(data.purchaseInvoices);
              else setPurchaseInvoices([]); 

              if (Array.isArray(data.history)) setHistory(data.history);
              if (Array.isArray(data.products)) setProducts(data.products);
              if (Array.isArray(data.customers)) setCustomers(data.customers);
              if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
              alert('تم استعادة البيانات بنجاح!');
          } catch (error) { alert('خطأ في قراءة الملف.'); }
      };
      reader.readAsText(file);
  };

  // Authentication & Loading Check
  if (isAppLoading) {
      return <LoadingScreen progress={loadingProgress} />;
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 print:bg-white">
      <Header 
        onOpenHistory={() => setShowHistory(true)} 
        onOpenDataManagement={() => setShowDataModal(true)}
        onOpenExpenses={() => setShowExpensesModal(true)}
        isOnline={isOnline}
        lastSyncTime={lastSyncTime}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        installPrompt={installPrompt}
        onInstall={handleInstallClick}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold mb-2 text-black">تقرير المبيعات اليومي</h1>
            <p className="text-gray-600">التاريخ: {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        {/* Summary shows total sales only */}
        <Summary items={sales} onPreview={() => setInvoiceItems(sales)} />

        <div className="mb-8">
            <POSInterface 
                onCompleteOrder={handleCompleteOrder} 
                products={products}
                customers={customers}
                onOpenProductManager={() => setShowProductManager(true)}
                onOpenCustomerManager={() => setShowCustomerManager(true)}
            />
        </div>

        <div className="mb-20 print:mb-0 border-t border-gray-700 pt-8">
            <div className="flex items-center justify-between mb-4 no-print">
                <h3 className="text-xl font-bold text-white">سجل الزبائن والمبيعات (اليوم الحالي)</h3>
                {sales.length > 0 && (
                    <button 
                        onClick={handleEndDay}
                        className="flex items-center gap-2 bg-green-900/40 hover:bg-green-900/60 text-green-400 px-4 py-2 rounded-xl transition-colors border border-green-800"
                    >
                        <Save size={18} />
                        <span className="font-bold">إغلاق اليوم (أرشفة)</span>
                    </button>
                )}
            </div>
            
            <SalesTable 
                items={sales} 
                onDeleteItem={handleDeleteItem} 
                onDeleteOrder={handleDeleteOrder}
                onPreviewInvoice={(items) => setInvoiceItems(items)}
            />
        </div>
      </main>

      {undoState && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-6 z-50 animate-fade-up min-w-[300px] justify-between">
              <span className="text-sm font-medium">تم حذف {undoState.items.length > 1 ? 'الطلب' : 'العنصر'}</span>
              <div className="flex items-center gap-4">
                  <button onClick={handleUndo} className="text-[#FA8072] font-bold text-sm flex items-center gap-1 hover:text-[#ff9a8d]"><RotateCcw size={16} /> تراجع</button>
                  <button onClick={() => { if (undoState.timerId) clearTimeout(undoState.timerId); setUndoState(null); }} className="text-gray-500 hover:text-white border-r border-gray-600 pr-4 mr-1"><X size={16} /></button>
              </div>
          </div>
      )}

      {invoiceItems && (
        <Suspense fallback={<ModalLoader />}>
            <InvoiceModal items={invoiceItems} onClose={() => setInvoiceItems(null)} />
        </Suspense>
      )}

      {showHistory && (
        <Suspense fallback={<ModalLoader />}>
            <HistoryModal 
                history={history} 
                onClose={() => setShowHistory(false)} 
                onClearHistory={() => setHistory([])}
                onPreviewInvoice={(items) => setInvoiceItems(items)}
            />
        </Suspense>
      )}
      
      {showProductManager && (
         <Suspense fallback={<ModalLoader />}>
            <ProductManager 
                isOpen={showProductManager}
                onClose={() => setShowProductManager(false)}
                products={products}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
            />
         </Suspense>
      )}

      {showCustomerManager && (
         <Suspense fallback={<ModalLoader />}>
            <CustomerManager 
                isOpen={showCustomerManager}
                onClose={() => setShowCustomerManager(false)}
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onDeleteCustomer={handleDeleteCustomer}
            />
         </Suspense>
      )}

      {showDataModal && (
        <Suspense fallback={<ModalLoader />}>
            <DataManagementModal 
                onClose={() => setShowDataModal(false)}
                onExport={handleExportData}
                onImport={handleImportData}
            />
        </Suspense>
      )}

      {showExpensesModal && (
          <Suspense fallback={<ModalLoader />}>
              <ExpensesModal
                isOpen={showExpensesModal}
                onClose={() => setShowExpensesModal(false)}
                currentPurchases={purchaseInvoices}
                archivedHistory={history}
                onAddInvoice={handleAddPurchaseInvoice}
                onDeleteInvoice={handleDeletePurchaseInvoice}
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
          </Suspense>
      )}

      <footer className="text-center py-6 text-gray-500 text-sm no-print mt-auto">
        <p>نظام محاسبة مخبز كوكيز - v1.3</p>
      </footer>
    </div>
  );
};

export default App;