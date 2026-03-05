"use client";

import { X, Clock, Package, CheckCircle, XCircle, User, Phone, Mail, MapPin, AlertCircle, Trash2 } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

interface OrderDetailsModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (orderId: Id<'orders'>, newStatus: string) => Promise<void>;
    onDeleteOrder: (orderId: Id<'orders'>) => Promise<void>;
    toppings: any[] | undefined;
    toppingCategories: any[] | undefined;
}

export default function OrderDetailsModal({
    order,
    isOpen,
    onClose,
    onStatusChange,
    onDeleteOrder,
    toppings,
    toppingCategories
}: OrderDetailsModalProps) {
    if (!isOpen || !order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-900">
                                Commande #{order._id.slice(-6).toUpperCase()}
                            </h2>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${order.type === 'delivery' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {order.type === 'delivery' ? 'Livraison' : 'Emporter'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleString('fr-FR')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Status & Payment Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                <AlertCircle className="w-4 h-4" />
                                <span className="uppercase tracking-wider">{order.status}</span>
                            </div>
                            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 uppercase tracking-wider shadow-sm">
                                {order.paymentMethod === 'cash' ? 'Espèces' : 'Stripe'} - {order.paymentStatus === 'paid' ? 'Payé' : 'À payer'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-sm font-medium text-slate-600">Changer le statut:</span>
                            <select
                                value={order.status}
                                onChange={(e) => onStatusChange(order._id, e.target.value)}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm cursor-pointer"
                            >
                                <option value="pending">En attente (Pending)</option>
                                <option value="preparing">En préparation (Preparing)</option>
                                <option value="completed">Terminée (Completed)</option>
                                <option value="cancelled">Annulée (Cancelled)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                <User className="w-4 h-4" /> Informations Client
                            </h3>
                            <div className="bg-white rounded-xl space-y-3">
                                <p className="font-bold text-slate-900 text-lg">{order.customer.firstName} {order.customer.lastName}</p>
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-600 flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {order.customer.email}
                                    </p>
                                    <p className="text-sm text-slate-600 flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <a href={`tel:${order.customer.phone}`} className="text-blue-600 hover:underline font-medium">{order.customer.phone}</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                <MapPin className="w-4 h-4" /> Détails Service
                            </h3>
                            <div className="bg-white rounded-xl space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Heure de retrait / livraison prévue :</p>
                                    <span className="inline-block font-bold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-lg text-sm">
                                        {order.scheduledTime === 'asap' || !order.scheduledTime ? 'Dès que possible' : order.scheduledTime}
                                    </span>
                                </div>

                                {order.type === 'delivery' && order.address && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-500 mb-1">Adresse de livraison :</p>
                                        <p className="text-sm text-slate-900 font-medium">
                                            {order.address.street}<br />
                                            {order.address.zipCode} {order.address.city}
                                        </p>
                                        {order.address.instructions && (
                                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-800">
                                                <span className="font-bold">Note du client :</span> {order.address.instructions}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Package className="w-4 h-4" /> Articles ({order.items.length})
                        </h3>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 text-base">{item.name}</p>
                                        {item.selectedSize && (
                                            <p className="text-sm text-slate-600 italic">Taille : {item.selectedSize}</p>
                                        )}
                                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {(() => {
                                                    const toppingsByCategory: Record<string, string[]> = {};
                                                    item.selectedToppings.forEach((toppingGroup: any) => {
                                                        toppingGroup.toppingIds.forEach((tId: string) => {
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
                                                        <div key={categoryName} className="text-xs flex gap-2">
                                                            <span className="font-bold text-slate-500 min-w-[80px]">{categoryName}:</span>
                                                            <span className="text-slate-700">{toppingNames.join(', ')}</span>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-black text-slate-900 text-lg whitespace-nowrap">{item.finalPrice.toFixed(2)}€</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Total */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande définitivement ?")) {
                                onDeleteOrder(order._id);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-lg text-slate-500 font-medium">Total Commande</span>
                        <span className="text-3xl font-black text-slate-900">{order.totalPrice.toFixed(2)}€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
