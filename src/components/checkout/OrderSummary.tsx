"use client";

import { ShoppingBag, Tag, Truck } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface OrderSummaryProps {
    orderItems: any[];
    subtotal: number;
    deliveryFee: number;
    totalWithDelivery: number;
    orderType: 'pickup' | 'delivery';
    isDeliverySupported: boolean;
}

export default function OrderSummary({
    orderItems,
    subtotal,
    deliveryFee,
    totalWithDelivery,
    orderType,
    isDeliverySupported
}: OrderSummaryProps) {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-display">
                    <ShoppingBag className="w-5 h-5 text-red-500" />
                    Mon Panier
                </h2>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-100 shadow-sm">
                    {orderItems.length} article{orderItems.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Items List */}
            <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-red-100 transition-colors">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-gray-200" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {item.priceOption}
                                </span>
                                {item.selectedToppings && item.selectedToppings.length > 0 && (
                                    <div className="flex -space-x-1 overflow-hidden">
                                        {/* Simple dot for toppings if too many */}
                                        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[100px]">
                                            + {item.selectedToppings.length} topping{item.selectedToppings.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm font-black text-gray-900 self-center">
                            {formatPrice(item.totalPrice)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Sous-total
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${!isDeliverySupported ? 'text-red-500' : ''}`} />
                            Frais de livraison
                        </span>
                        <span className={`font-bold ${!isDeliverySupported ? 'text-red-500' : 'text-gray-900'}`}>
                            {isDeliverySupported ? (deliveryFee === 0 ? 'OFFERT' : formatPrice(deliveryFee)) : 'Non supporté'}
                        </span>
                    </div>
                )}

                <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Total à payer</span>
                        <span className="text-3xl font-black text-red-600 font-display tabular-nums">
                            {formatPrice(orderType === 'delivery' ? totalWithDelivery : subtotal)}
                        </span>
                    </div>
                    {orderType === 'delivery' && deliveryFee === 0 && isDeliverySupported && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase mb-2">Livraison Offerte</span>
                    )}
                </div>
            </div>
        </div>
    );
}
