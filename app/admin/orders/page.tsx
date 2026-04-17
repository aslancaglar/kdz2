"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Package, Bell, BellOff } from 'lucide-react';
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-orders-sound-enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
      soundEnabledRef.current = true;
    }
  }, []);



  const filteredOrders = useMemo(() =>
    orders?.filter((order) => selectedStatus === 'all' || order.status === selectedStatus),
    [orders, selectedStatus]
  );

  const selectedOrder = useMemo(() =>
    orders?.find(o => o._id === selectedOrderId),
    [orders, selectedOrderId]
  );


  const toggleSound = useCallback(() => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundEnabledRef.current = nextState;
    localStorage.setItem('admin-orders-sound-enabled', String(nextState));

    if (nextState) {
      // iOS Safari REQUIRES that Audio is created AND play() is called synchronously
      // within a user gesture handler. This is the only reliable way to unlock audio on iOS.
      if (!audioRef.current) {
        const audio = new Audio('/sounds/new-order.mp3?v=2');
        audio.loop = true;
        audioRef.current = audio;
      }

      // Always call play() during the click event to unlock iOS audio context
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // If no pending orders, immediately pause after unlocking
          const hasPending = orders?.some(o => o.status === 'pending');
          if (!hasPending && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }).catch(e => console.log('iOS audio unlock failed:', e));
      }
    } else {
      // Disable: stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [soundEnabled, orders]);

  // Monitor pending orders and play/stop sound accordingly
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      const audio = new Audio('/sounds/new-order.mp3?v=' + Date.now());
      audio.loop = true;
      audioRef.current = audio;
    }

    if (!orders || !audioRef.current) return;

    const hasPending = orders.some(o => o.status === 'pending');
    if (soundEnabledRef.current && hasPending) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent fail — will be retried on next order change
        });
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [orders, soundEnabled]);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Commandes</h1>
            <p className="text-slate-600 mt-2">Affichez et gérez les commandes des clients</p>
          </div>
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition group ${soundEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {soundEnabled ? (
              <Bell className="w-4 h-4 text-emerald-600 active:scale-95 transition-transform" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
            )}
            <span className="font-semibold text-sm">
              {soundEnabled ? 'Son Activé' : 'Son Désactivé'}
            </span>
          </button>
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
