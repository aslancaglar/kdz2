import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { useHeroVideoUrl } from '../context/VideoContext';
import {
    User as UserIcon,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronRight,
    Star,
    Clock,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    CheckCircle2,
    Truck,
    Store,
    AlertCircle,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'profile' | 'orders';

export default function AccountPage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Queries
    const orders = useQuery(api.auth.listUserOrders, user ? { userId: user.id as any } : 'skip');
    const addReview = useMutation(api.reviews.addOrderReview);
    const updateProfile = useMutation(api.auth.updateUser);
    const videoUrl = useHeroVideoUrl();

    // Profile form state
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.street || '',
        city: user?.city || '',
        zipCode: user?.zipCode || ''
    });

    const selectedOrder = useMemo(() =>
        orders?.find(o => o._id === selectedOrderId),
        [orders, selectedOrderId]);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({
                id: user.id as any,
                ...formData
            });
            updateUser(formData);
            setIsEditing(false);
            // In a real app, AuthContext should ideally refresh or the user object should be updated.
            // For now, we rely on the database state.
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erreur lors de la mise à jour du profil.');
        }
    };

    const handleSubmitRating = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderId) return;

        setIsSubmittingRating(true);
        try {
            await addReview({
                userId: user.id as any,
                orderId: selectedOrderId as any,
                name: `${user.firstName} ${user.lastName}`,
                rating,
                comment,
            });
            setIsRatingOpen(false);
            setRating(5);
            setComment('');
            alert('Merci pour votre avis !');
        } catch (error: any) {
            alert(error.message || 'Une erreur est survenue.');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'preparing': return 'bg-blue-100 text-blue-700';
            case 'ready': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'preparing': return 'En préparation';
            case 'ready': return 'Prêt';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-[30vh] min-h-[250px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {videoUrl ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="hidden md:block w-full h-full object-cover"
                            key={videoUrl}
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="absolute inset-0 bg-dark-950" />
                    )}
                    <img
                        src="https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1920"
                        alt="Kebab background"
                        className="md:hidden w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
                </div>

                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8">
                    <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-3 tracking-wide uppercase">
                        Mon Compte
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light">
                        Gérez votre profil et vos commandes
                    </p>
                </div>
            </section>

            <div className="pt-12 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 hidden">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-gray-900">
                                    Bonjour, {user.firstName}
                                </h1>
                                <p className="text-gray-500">Gérez votre profil et vos commandes</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:text-red-600 transition-all border border-gray-100"
                        >
                            <LogOut className="w-5 h-5" />
                            Se déconnecter
                        </button>
                    </div>

                    {/* Mobile Logout Button (Visible since main header is hidden) */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 text-sm font-bold rounded-xl shadow-sm hover:text-red-600 transition-colors border border-gray-100"
                        >
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Tabs */}
                        <div className="lg:col-span-1 space-y-2">
                            <button
                                onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Mes Commandes
                            </button>
                            <button
                                onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                Mon Profil
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {activeTab === 'orders' ? (
                                <div className="space-y-6">
                                    {selectedOrderId && selectedOrder ? (
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                                <button
                                                    onClick={() => setSelectedOrderId(null)}
                                                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-bold transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5" />
                                                    Retour
                                                </button>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">Commande</p>
                                                    <p className="font-mono font-bold text-gray-900">#{(selectedOrderId as any).substring(0, 8).toUpperCase()}</p>
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                {/* Order Details Content */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                    <div className="space-y-8">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                                <ShoppingBag className="w-5 h-5 text-red-500" />
                                                                Articles
                                                            </h3>
                                                            <div className="space-y-4">
                                                                {selectedOrder.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                                        <div>
                                                                            <p className="font-bold text-gray-900">{item.name}</p>
                                                                            {item.selectedSize && (
                                                                                <p className="text-sm text-gray-500 capitalize italic">Taille: {item.selectedSize}</p>
                                                                            )}
                                                                            {item.selectedToppings?.map((cat, cIdx) => (
                                                                                <p key={cIdx} className="text-xs text-gray-400">
                                                                                    + {cat.toppingIds.join(', ')}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                        <p className="font-bold text-red-500">{item.finalPrice.toFixed(2)}€</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t border-gray-100">
                                                            <div className="flex justify-between items-center text-xl font-display font-black">
                                                                <span>Total</span>
                                                                <span className="text-red-500">{selectedOrder.totalPrice.toFixed(2)}€</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-8">
                                                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                                Statut & Paiement
                                                            </h3>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                                                                    {getStatusLabel(selectedOrder.status)}
                                                                </span>
                                                                <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                                    {selectedOrder.paymentMethod === 'cash' ? 'Espèces' : 'Stripe'} - {selectedOrder.paymentStatus === 'paid' ? 'Payé' : 'À payer'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 px-2">
                                                            <div className="flex items-start gap-3">
                                                                <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">Horaire prévu</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {selectedOrder.scheduledTime === 'asap' || !selectedOrder.scheduledTime ? 'Dès que possible' : selectedOrder.scheduledTime}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">Passée le {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-3">
                                                                {selectedOrder.type === 'delivery' ? (
                                                                    <Truck className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                                                                ) : (
                                                                    <Store className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">{selectedOrder.type === 'delivery' ? 'Livraison' : 'À emporter'}</p>
                                                                    {selectedOrder.type === 'delivery' && selectedOrder.address && (
                                                                        <div className="text-sm text-gray-500 italic">
                                                                            <p>{selectedOrder.address.street}</p>
                                                                            <p>{selectedOrder.address.zipCode} {selectedOrder.address.city}</p>
                                                                            {selectedOrder.address.instructions && (
                                                                                <p className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg not-italic">
                                                                                    <span className="font-bold">Note: </span> {selectedOrder.address.instructions}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {selectedOrder.status === 'completed' && (
                                                            <button
                                                                onClick={() => setIsRatingOpen(true)}
                                                                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <Star className="w-5 h-5" />
                                                                Laisser un avis
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                                <h2 className="text-xl font-display font-bold text-gray-900">Historique des commandes</h2>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {orders === undefined ? (
                                                    <div className="p-12 text-center text-gray-400 animate-pulse">Chargement de vos commandes...</div>
                                                ) : orders.length === 0 ? (
                                                    <div className="p-12 text-center space-y-4">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                                            <ShoppingBag className="w-10 h-10 text-gray-200" />
                                                        </div>
                                                        <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
                                                        <button
                                                            onClick={() => navigate('/menu')}
                                                            className="px-6 py-2 bg-red-500 text-white font-bold rounded-full text-sm"
                                                        >
                                                            Voir le menu
                                                        </button>
                                                    </div>
                                                ) : (
                                                    orders.map((order) => (
                                                        <div
                                                            key={order._id}
                                                            onClick={() => setSelectedOrderId(order._id)}
                                                            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                                                                    <ShoppingBag className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-mono font-bold text-gray-900">#{(order._id as any).substring(0, 8).toUpperCase()}</p>
                                                                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between md:justify-end gap-8">
                                                                <div className="text-right">
                                                                    <p className="font-black text-gray-900">{order.totalPrice.toFixed(2)}€</p>
                                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">{order.items.length} {order.items.length > 1 ? 'articles' : 'article'}</p>
                                                                </div>
                                                                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h2 className="text-xl font-display font-bold text-gray-900">Informations personnelles</h2>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-red-500 font-bold hover:underline"
                                            >
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-8">
                                        {isEditing ? (
                                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Prénom</label>
                                                        <input
                                                            type="text"
                                                            value={formData.firstName}
                                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Nom</label>
                                                        <input
                                                            type="text"
                                                            value={formData.lastName}
                                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Téléphone</label>
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 space-y-4">
                                                    <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Adresse par défaut</h3>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Rue</label>
                                                        <input
                                                            type="text"
                                                            value={formData.street}
                                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            placeholder="N° et nom de rue"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700 ml-1">Code Postal</label>
                                                            <input
                                                                type="text"
                                                                value={formData.zipCode}
                                                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                                placeholder="57000"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-gray-700 ml-1">Ville</label>
                                                            <input
                                                                type="text"
                                                                value={formData.city}
                                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                                placeholder="Metz"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                                                    >
                                                        Enregistrer les modifications
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(false)}
                                                        className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="space-y-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm shrink-0">
                                                            <Mail className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                                            <p className="font-bold text-gray-900">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm shrink-0">
                                                            <Phone className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Téléphone</p>
                                                            <p className="font-bold text-gray-900">{user.phone || 'Non renseigné'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-red-500" />
                                                        Mon Adresse de Livraison
                                                    </h3>
                                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                                        {user.street ? (
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-gray-900 text-lg">{user.street}</p>
                                                                <p className="text-gray-500">{user.zipCode} {user.city}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Aucune adresse enregistrée.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rating Modal */}
                {isRatingOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRatingOpen(false)} />
                        <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 pb-0 flex justify-between items-center">
                                <h2 className="text-2xl font-display font-black text-gray-900">Votre avis</h2>
                                <button onClick={() => setIsRatingOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitRating} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <p className="text-center text-gray-500 font-medium">Comment s'est passée votre commande ?</p>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-orange-400' : 'text-gray-200'}`}
                                            >
                                                <Star className={`w-10 h-10 ${star <= rating ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 ml-1">Commentaire</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all min-h-[120px] resize-none"
                                        placeholder="Partagez votre expérience..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingRating}
                                    className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSubmittingRating ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Publier l'avis
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
