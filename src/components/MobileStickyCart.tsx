import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function MobileStickyCart() {
  const { getItemCount, getTotalPrice, orderItems, removeFromOrder } = useOrder();
  const restaurantInfo = useQuery(api.restaurantInfo.get);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    // Show cart when items are added
    if (itemCount > 0) {
      setIsVisible(true);
    }
  }, [itemCount]);

  // Don't render if no items or on desktop
  if (itemCount === 0 || typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  const handleCheckout = () => {
    if (restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled) {
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      {/* Expanded Mini Cart Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded Mini Cart */}
      {isExpanded && (
        <div className="fixed bottom-24 left-4 right-4 bg-white rounded-2xl shadow-2xl z-50 lg:hidden max-h-[60vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-gray-900">Votre commande ({itemCount})</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.priceOption}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{item.totalPrice.toFixed(2)}€</span>
                  <button 
                    onClick={() => removeFromOrder(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Total</span>
              <span className="text-xl font-bold text-red-500">{totalPrice.toFixed(2)}€</span>
            </div>
            
            {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-sm">
                <p className="text-amber-800 font-medium">Commandes indisponibles</p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all shadow-lg"
              >
                Commander
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Cart Icon + Count */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
                <p className="font-bold text-gray-900">{totalPrice.toFixed(2)}€</p>
              </div>
            </button>

            {/* Right: Checkout Button */}
            {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled ? (
              <span className="text-xs text-amber-600 font-medium">Indisponible</span>
            ) : (
              <button
                onClick={handleCheckout}
                className="bg-red-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-600 transition-all shadow-lg text-sm"
              >
                Commander
              </button>
            )}
          </div>
        </div>
        
        {/* Safe area padding for iOS */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </div>
    </>
  );
}
