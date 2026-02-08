import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function OrdersPage() {
  const orders = useQuery(api.queries.getAllOrders);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const toppings = useQuery(api.toppingsAdmin.listToppings);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const filteredOrders = orders?.filter(
    (order) => selectedStatus === 'all' || order.status === selectedStatus
  );

  const handleStatusChange = async (orderId: Id<'orders'>, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus as any });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'preparing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-2">View and manage customer orders</p>
        </div>

        <div className="flex gap-3">
          {['all', 'pending', 'preparing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${selectedStatus === status
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order._id);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleOrderExpand(order._id)}
                    className="w-full p-6 flex items-start justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">Commande #{order._id.slice(-6).toUpperCase()}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${order.type === 'delivery' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {order.type === 'delivery' ? 'Livraison' : 'Emporter'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 leading-tight">
                          {order.totalPrice.toFixed(2)}€
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mt-1 ${getStatusColor(order.status)} uppercase tracking-tighter`}>
                          {order.status}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="grid md:grid-cols-2 gap-8 mb-6 pt-6">
                        {/* Customer Info */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client</h4>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="font-bold text-slate-900">{order.customer.firstName} {order.customer.lastName}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="opacity-50 text-xs">Email:</span> {order.customer.email}
                              </p>
                              <p className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="opacity-50 text-xs">Tél:</span>
                                <a href={`tel:${order.customer.phone}`} className="text-blue-600 hover:underline">{order.customer.phone}</a>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Delivery / Pickup Details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détails Service</h4>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-500">Heure prévue:</span>
                              <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg text-sm">
                                {order.scheduledTime === 'asap' || !order.scheduledTime ? 'Dès que possible' : new Date(order.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {order.type === 'delivery' && order.address && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">Adresse:</p>
                                <p className="text-sm text-slate-900 leading-snug">
                                  {order.address.street}<br />
                                  {order.address.zipCode} {order.address.city}
                                </p>
                                {order.address.instructions && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800 border border-yellow-100">
                                    <strong>Note:</strong> {order.address.instructions}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-900 mb-2">Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{item.name}</p>
                                {item.selectedSize && (
                                  <p className="text-sm text-slate-600">Size: {item.selectedSize}</p>
                                )}
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Garnitures:</p>
                                    <div className="space-y-1">
                                      {(() => {
                                        // Group toppings by their category
                                        const toppingsByCategory: Record<string, string[]> = {};
                                        
                                        item.selectedToppings.forEach((toppingGroup) => {
                                          toppingGroup.toppingIds.forEach((tId) => {
                                            const topping = toppings?.find(t => t.toppingId === tId);
                                            if (topping) {
                                              const categoryId = topping.categoryId;
                                              const categoryName = toppingCategories?.find(c => c.categoryId === categoryId)?.name || 'Options';
                                              
                                              if (!toppingsByCategory[categoryName]) {
                                                toppingsByCategory[categoryName] = [];
                                              }
                                              toppingsByCategory[categoryName].push(topping.name);
                                            }
                                          });
                                        });
                                        
                                        return Object.entries(toppingsByCategory).map(([categoryName, toppingNames]) => (
                                          <div key={categoryName} className="text-sm flex">
                                            <span className="font-medium text-slate-700 min-w-[100px]">{categoryName}:</span>
                                            <span className="text-slate-600">{toppingNames.join(', ')}</span>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="font-bold text-slate-900 ml-4">{item.finalPrice.toFixed(2)}€</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">There are no orders matching the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
