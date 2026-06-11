import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, CreditCard, Package, X, ChevronRight, FileText, Receipt } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);

  const navItems = [
    { 
      id: 'order', 
      label: 'Order', 
      icon: ShoppingCart,
      subItems: [
        { label: 'Add Order', path: '/order_product' },
        { label: 'Manage Order', path: '/manage_order' }
      ]
    },
    // { 
    //   id: 'credit', 
    //   label: 'Credit', 
    //   icon: CreditCard,
    //   subItems: [
    //     { label: 'Add Credit', path: '/add_credit' },
    //     { label: 'Manage Credit', path: '/manage_credit' }
    //   ]
    // },
    { 
      id: 'product', 
      label: 'Product', 
      icon: Package,
      subItems: [
        { label: 'Add Product', path: '/add_product' },
        { label: 'Manage Product', path: '/manage_product' }
      ]
    },
  ];

  const handleItemClick = (item) => {
    if (expandedItem === item.id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(item.id);
    }
  };

  const isItemActive = (item) => {
    return item.subItems.some(subItem => location.pathname === subItem.path);
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {expandedItem && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setExpandedItem(null)}
        />
      )}
      
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        {/* Expanded Menu */}
        {expandedItem && (
          <div className="px-4 py-6 border-b border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {navItems.find(item => item.id === expandedItem)?.label}
              </h3>
              <button 
                onClick={() => setExpandedItem(null)}
                className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-3">
              {navItems.find(item => item.id === expandedItem)?.subItems.map((subItem, index) => (
                <button
                  key={subItem.path}
                  onClick={() => {
                    navigate(subItem.path);
                    setExpandedItem(null);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                    location.pathname === subItem.path 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 active:scale-98'
                  }`}
                  style={{ 
                    transform: `translateY(${expandedItem ? 0 : 20}px)`,
                    opacity: expandedItem ? 1 : 0,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <span className="font-semibold">{subItem.label}</span>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <div className="flex px-2 py-2 bg-white/95 backdrop-blur-md">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 mx-1 rounded-xl transition-all duration-300 ${
                expandedItem === item.id || isItemActive(item)
                  ? 'text-blue-600 scale-105'
                  : 'text-gray-600 hover:bg-gray-50 active:scale-95'
              }`}
              style={{
                transform: expandedItem === item.id ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div className={`mb-1 transition-transform duration-200 ${
                expandedItem === item.id ? 'scale-110' : 'scale-100'
              }`}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-semibold">{item.label}</span>
              
              {/* Active indicator dot */}
              {(expandedItem === item.id || isItemActive(item)) && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        {/* Home indicator for iOS-like feel */}
        <div className="flex justify-center py-1 bg-white/95">
          <div className="w-32 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
