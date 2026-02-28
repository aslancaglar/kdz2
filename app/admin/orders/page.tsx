"use client";

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Package, Clock } from 'lucide-react';
import OrderCard from '../../../src/components/admin/Orders/OrderCard';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function OrdersPage() {
  const { adminToken } = useAdminAuth();
  const orders = useQuery(api.queries.getAllOrders, adminToken ? { adminToken } : "skip");
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const toppings = useQuery(api.toppingsAdmin.listToppings);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const filteredOrders = useMemo(() =>
    orders?.filter((order) => selectedStatus === 'all' || order.status === selectedStatus),
    [orders, selectedStatus]
  );

  const handleStatusChange = useCallback(async (orderId: Id<'orders'>, newStatus: string) => {
    if (!adminToken) return;
    try {
      await updateOrderStatus({ orderId, status: newStatus as any, adminToken });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, [updateOrderStatus, adminToken]);

  const toggleOrderExpand = useCallback((orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);



  return (
    <>
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
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isExpanded={expandedOrders.has(order._id)}
                onToggleExpand={toggleOrderExpand}
                onStatusChange={handleStatusChange}
                toppings={toppings}
                toppingCategories={toppingCategories}
              />
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
    </>
  );
}
