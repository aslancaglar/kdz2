"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Package } from 'lucide-react';
import OrderCard from '../../../src/components/admin/Orders/OrderCard';
import OrderDetailsModal from '../../../src/components/admin/Orders/OrderDetailsModal';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function OrdersPage() {
  const { adminToken } = useAdminAuth();
  const orders = useQuery(api.queries.getAllOrders, adminToken ? { adminToken } : "skip");
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const toppings = useQuery(api.toppingsAdmin.listToppings);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);
  const deleteOrderMutation = useMutation(api.mutations.deleteOrder);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() =>
    orders?.filter((order) => selectedStatus === 'all' || order.status === selectedStatus),
    [orders, selectedStatus]
  );

  const selectedOrder = useMemo(() =>
    orders?.find(o => o._id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      const audio = new Audio('/sounds/new-order.ogg');
      audio.loop = true;
      audioRef.current = audio;
    }

    if (orders) {
      const hasPending = orders.some(o => o.status === 'pending');
      if (hasPending && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio autoplay prevented by browser. User interaction needed."));
        }
      } else if (!hasPending && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [orders]);

  const handleStatusChange = useCallback(async (orderId: Id<'orders'>, newStatus: string) => {
    if (!adminToken) return;
    try {
      await updateOrderStatus({ orderId, status: newStatus as any, adminToken });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, [updateOrderStatus, adminToken]);

  const handleDeleteOrder = useCallback(async (orderId: Id<'orders'>) => {
    if (!adminToken) return;
    try {
      await deleteOrderMutation({ orderId, adminToken });
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }, [deleteOrderMutation, adminToken]);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-2">View and manage customer orders</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'pending', 'preparing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${selectedStatus === status
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              {status === 'all' ? 'Toutes' :
                status === 'pending' ? 'En attente' :
                  status === 'preparing' ? 'Préparation' :
                    status === 'completed' ? 'Terminées' : 'Annulées'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={setSelectedOrderId}
                onAccept={(id) => handleStatusChange(id as Id<'orders'>, 'preparing')}
                onDecline={(id) => handleStatusChange(id as Id<'orders'>, 'cancelled')}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune commande</h3>
              <p className="text-slate-600">Il n'y a pas de commandes correspondant à ce statut.</p>
            </div>
          )}
        </div>
      </div>

      <OrderDetailsModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onDeleteOrder={handleDeleteOrder}
        toppings={toppings}
        toppingCategories={toppingCategories}
      />
    </>
  );
}
