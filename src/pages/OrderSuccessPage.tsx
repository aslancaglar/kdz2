import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CheckCircle, Package, Home } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

export default function OrderSuccessPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const order = useQuery(api.queries.getOrder, { orderId: orderId as Id<'orders'> });

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Merci pour votre commande !</h1>
                <p className="text-gray-600 mb-8">
                    Votre commande <span className="font-mono font-bold text-red-500">#{orderId?.slice(-6).toUpperCase()}</span> a été reçue avec succès.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Statut</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                            {order.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className="font-bold text-gray-900 capitalize">{order.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Heure prévue</span>
                        <span className="font-bold text-gray-900">
                            {order.scheduledTime === 'asap' || !order.scheduledTime 
                                ? 'Dès que possible' 
                                : new Date(order.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to="/menu"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-bold text-sm"
                    >
                        <Package className="w-4 h-4" />
                        Menu
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
