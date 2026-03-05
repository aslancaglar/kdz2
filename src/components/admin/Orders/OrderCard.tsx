"use client";

import { Clock, Package, CheckCircle, XCircle, User } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

interface OrderCardProps {
    order: any;
    onClick: (orderId: string) => void;
}

export default function OrderCard({
    order,
    onClick
}: OrderCardProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'preparing': return <Package className="w-5 h-5 text-blue-600" />;
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Package className="w-5 h-5 text-slate-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <button
            onClick={() => onClick(order._id)}
            className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 gap-4"
        >
            <div className="flex items-start md:items-center gap-4.5">
                <div className={`p-3.5 rounded-xl border flex-shrink-0 transition-colors ${getStatusColor(order.status)} group-hover:bg-opacity-80`}>
                    {getStatusIcon(order.status)}
                </div>
                <div className="text-left flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-lg">Commande #{order._id.slice(-6).toUpperCase()}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-widest ${order.type === 'delivery' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {order.type === 'delivery' ? 'Livraison' : 'Emporter'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-slate-400" />
                            {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto pt-4 md:pt-0 border-t border-slate-100 md:border-none">
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {order.totalPrice.toFixed(2)}€
                </div>
                <span className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-bold rounded-full border ${getStatusColor(order.status)} uppercase tracking-widest min-w-[100px]`}>
                    {order.status}
                </span>
            </div>
        </button>
    );
}
