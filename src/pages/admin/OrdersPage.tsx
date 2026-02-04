import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function OrdersPage() {
  const orders = useQuery(api.queries.getAllOrders);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders = orders?.filter(
    (order) => selectedStatus === 'all' || order.status === selectedStatus
  );

  const handleStatusChange = async (orderId: Id<'orders'>, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
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
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === status
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
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-bold text-slate-900">Order #{order._id.slice(-8)}</h3>
                      <p className="text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {order.totalPrice.toFixed(2)}€
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.selectedSize && (
                            <p className="text-sm text-slate-600">Size: {item.selectedSize}</p>
                          )}
                          {item.selectedToppings && item.selectedToppings.length > 0 && (
                            <p className="text-sm text-slate-600">
                              Toppings: {item.selectedToppings.map((t) => t.toppingIds.length).reduce((a, b) => a + b, 0)} selected
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">{item.finalPrice.toFixed(2)}€</p>
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
            ))
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
