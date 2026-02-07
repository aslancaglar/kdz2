import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StripePaymentForm from '../components/StripePaymentForm';
import {
    ChevronRight,
    MapPin,
    Clock,
    User as UserIcon,
    CreditCard,
    ShoppingBag,
    ArrowLeft,
    Truck,
    Store,
    Wallet,
    CheckCircle2,
    Edit,
    Lock
} from 'lucide-react';



type Step = 'details' | 'info' | 'payment';

const HERO_VIDEO_ID = "kg218cqrg7hzg0ghqj531aqpy180haz8" as any;

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { orderItems, getTotalPrice, clearOrder } = useOrder();
    const { user, isLoading: authLoading } = useAuth();
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const createOrder = useMutation(api.mutations.createOrder);
    const videoUrl = useQuery(api.files.getUrl, { storageId: HERO_VIDEO_ID });

    const [step, setStep] = useState<Step>('details');
    const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
    const [scheduledTime, setScheduledTime] = useState<string>('');

    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [address, setAddress] = useState({
        street: '',
        city: '',
        zipCode: '',
        instructions: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [showStripeForm, setShowStripeForm] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login?redirect=checkout');
        }
    }, [user, authLoading, navigate]);

    // Pre-fill user data
    useEffect(() => {
        if (user) {
            setCustomer({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || ''
            });

            if (user.street || user.city || user.zipCode) {
                setAddress(prev => ({
                    ...prev,
                    street: user.street || '',
                    city: user.city || '',
                    zipCode: user.zipCode || ''
                }));
            }
        }
    }, [user]);

    // Handle ordering options availability
    useEffect(() => {
        if (restaurantInfo) {
            const pickupEnabled = restaurantInfo.pickupEnabled ?? true;
            const deliveryEnabled = restaurantInfo.deliveryEnabled ?? true;
            
            // If only one option is enabled, auto-select it
            if (pickupEnabled && !deliveryEnabled) {
                setOrderType('pickup');
            } else if (!pickupEnabled && deliveryEnabled) {
                setOrderType('delivery');
            }
        }
    }, [restaurantInfo]);

    const timeSlots = useMemo(() => {
        const slots = [{ label: 'Dès que possible', value: 'asap' }];
        const now = new Date();
        // Round to nearest 15 mins
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        now.setSeconds(0);
        now.setMilliseconds(0);

        for (let i = 0; i < 16; i++) {
            const slot = new Date(now.getTime() + i * 15 * 60000);
            slots.push({
                label: slot.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                value: slot.toISOString()
            });
        }
        return slots;
    }, [restaurantInfo]);

    // Set initial time slot
    useEffect(() => {
        if (timeSlots.length > 0 && !scheduledTime) {
            setScheduledTime(timeSlots[0].value);
        }
    }, [timeSlots, scheduledTime]);

    const handleNext = () => {
        if (step === 'details') setStep('info');
        else if (step === 'info') setStep('payment');
    };

    const handleBack = () => {
        if (step === 'info') setStep('details');
        else if (step === 'payment') setStep('info');
        else navigate(-1);
    };

    const createPaymentIntent = async () => {
        try {
            setIsSubmitting(true);
            // For testing, we'll create a simulated payment intent
            // In production, this should call your backend to create a real payment intent
            const mockClientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
            setClientSecret(mockClientSecret);
            setShowStripeForm(true);
            setStripeError(null);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            setStripeError('Erreur lors de la préparation du paiement. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStripeSuccess = async (paymentIntentId: string) => {
        setIsSubmitting(true);
        try {
                const orderId = await createOrder({
                    userId: user?.id as any,
                    customer,
                    type: orderType,
                    address: orderType === 'delivery' ? address : undefined,
                    scheduledTime: scheduledTime || 'asap',
                    paymentMethod: 'stripe',
                paymentStatus: 'paid',
                stripePaymentIntentId: paymentIntentId,
                items: orderItems.map(item => ({
                    menuItemId: item.menuItemId,
                    name: item.name,
                    price: item.basePrice,
                    selectedSize: item.priceOption,
                    selectedToppings: item.selectedToppings.map(t => ({
                        categoryId: '',
                        toppingIds: [t.toppingId]
                    })),
                    finalPrice: item.totalPrice
                })),
                totalPrice: getTotalPrice()
            });

            clearOrder();
            navigate(`/order-success/${orderId}`);
        } catch (error) {
            console.error('Failed to create order:', error);
            setStripeError('Une erreur est survenue lors de la création de la commande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStripeError = (error: string) => {
        setStripeError(error);
    };

    const handleSubmit = async () => {
        if (paymentMethod === 'stripe' && !showStripeForm) {
            await createPaymentIntent();
            return;
        }

        if (paymentMethod === 'cash') {
            setIsSubmitting(true);
            try {
                const orderId = await createOrder({
                    userId: user?.id as any,
                    customer,
                    type: orderType,
                    address: orderType === 'delivery' ? address : undefined,
                    scheduledTime: scheduledTime || 'asap',
                    paymentMethod: 'cash',
                    paymentStatus: 'unpaid',
                    items: orderItems.map(item => ({
                        menuItemId: item.menuItemId,
                        name: item.name,
                        price: item.basePrice,
                        selectedSize: item.priceOption,
                        selectedToppings: item.selectedToppings.map(t => ({
                            categoryId: '',
                            toppingIds: [t.toppingId]
                        })),
                        finalPrice: item.totalPrice
                    })),
                    totalPrice: getTotalPrice()
                });

                clearOrder();
                navigate(`/order-success/${orderId}`);
            } catch (error) {
                console.error('Failed to create order:', error);
                alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (orderItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
                    <button onClick={() => navigate('/menu')} className="text-red-500 font-bold hover:underline">Voir le menu</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

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

                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8 md:pt-0">
                    <h1 className="font-display font-extrabold text-5xl md:text-6xl text-white mb-3 tracking-wide uppercase">
                        Ma Commande
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light">
                        Presque fini ! Vérifiez vos détails.
                    </p>
                </div>
            </section>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Form Content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button onClick={handleBack} className="p-2 hover:bg-white rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 font-display">Finaliser ma commande</h1>
                        </div>

                        {/* Stepper Header */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-8">
                            {[
                                { id: 'details', icon: Clock, label: 'Mode' },
                                { id: 'info', icon: UserIcon, label: 'Infos' },
                                { id: 'payment', icon: CreditCard, label: 'Paiement' }
                            ].map((s, idx) => (
                                <React.Fragment key={s.id}>
                                    <div key={idx} className={`flex items-center gap-2 ${step === s.id ? 'text-red-500' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s.id ? 'bg-red-50' : 'bg-gray-50'}`}>
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold hidden sm:block">{s.label}</span>
                                    </div>
                                    {idx < 2 && <ChevronRight key={`sep-${idx}`} className="w-4 h-4 text-gray-200" />}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            {step === 'details' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled ? (
                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                                            <p className="text-amber-800 font-bold text-lg mb-2">
                                                Les commandes sont temporairement indisponibles
                                            </p>
                                            <p className="text-amber-600">
                                                Veuillez nous appeler pour passer commande
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setOrderType('pickup')}
                                                disabled={restaurantInfo ? !restaurantInfo.pickupEnabled : false}
                                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                                                    orderType === 'pickup' 
                                                        ? 'border-red-500 bg-red-50 text-red-600' 
                                                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                } ${restaurantInfo && !restaurantInfo.pickupEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Store className="w-8 h-8" />
                                                <span className="font-bold">À emporter</span>
                                                {restaurantInfo && !restaurantInfo.pickupEnabled && (
                                                    <span className="text-xs text-red-500">Indisponible</span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setOrderType('delivery')}
                                                disabled={restaurantInfo ? !restaurantInfo.deliveryEnabled : false}
                                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                                                    orderType === 'delivery' 
                                                        ? 'border-red-500 bg-red-50 text-red-600' 
                                                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                } ${restaurantInfo && !restaurantInfo.deliveryEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Truck className="w-8 h-8" />
                                                <span className="font-bold">Livraison</span>
                                                {restaurantInfo && !restaurantInfo.deliveryEnabled && (
                                                    <span className="text-xs text-red-500">Indisponible</span>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-red-500" />
                                            Heure de {orderType === 'pickup' ? 'récupération' : 'livraison'}
                                        </h3>
                                        <div className="relative group">
                                            <select
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 appearance-none font-medium text-gray-900 cursor-pointer transition-all"
                                            >
                                                {timeSlots.map((slot: { label: string; value: string }) => (
                                                    <option key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-red-500 transition-colors">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 px-1 italic">
                                            {scheduledTime === 'asap'
                                                ? 'Votre commande sera préparée en priorité.'
                                                : `Prévu pour ${timeSlots.find(s => s.value === scheduledTime)?.label}.`
                                            }
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={restaurantInfo ? (!restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled) : false}
                                        className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Suivant
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {step === 'info' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4">
                                    {!isEditingInfo && user ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <UserIcon className="w-5 h-5 text-red-500" />
                                                    Mes informations
                                                </h3>
                                                <button
                                                    onClick={() => setIsEditingInfo(true)}
                                                    className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Modifier
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Contact</p>
                                                    <p className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                                                    <p className="text-sm text-gray-600">{customer.email}</p>
                                                    <p className="text-sm text-gray-600">{customer.phone}</p>
                                                </div>

                                                {orderType === 'delivery' && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Adresse de livraison</p>
                                                        {address.street ? (
                                                            <>
                                                                <p className="font-bold text-gray-900">{address.street}</p>
                                                                <p className="text-sm text-gray-600">{address.zipCode} {address.city}</p>
                                                                {address.instructions && (
                                                                    <p className="text-xs text-gray-500 mt-2 italic">Note: {address.instructions}</p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-amber-600 font-medium">Adresse non renseignée</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleNext}
                                                disabled={!customer.firstName || !customer.lastName || !customer.phone || (orderType === 'delivery' && !address.street)}
                                                className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                                            >
                                                Continuer vers le paiement
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Prénom</label>
                                                    <input
                                                        type="text"
                                                        value={customer.firstName}
                                                        onChange={e => setCustomer({ ...customer, firstName: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                        placeholder="Ex: Jean"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Nom</label>
                                                    <input
                                                        type="text"
                                                        value={customer.lastName}
                                                        onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                        placeholder="Ex: Dupont"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    value={customer.email}
                                                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                    placeholder="votre@email.com"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Téléphone</label>
                                                <input
                                                    type="tel"
                                                    value={customer.phone}
                                                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                    placeholder="06 12 34 56 78"
                                                />
                                            </div>

                                            {orderType === 'delivery' && (
                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-red-500" />
                                                        Adresse de livraison
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={address.street}
                                                            onChange={e => setAddress({ ...address, street: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                            placeholder="Numéro et nom de rue"
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <input
                                                                type="text"
                                                                value={address.city}
                                                                onChange={e => setAddress({ ...address, city: e.target.value })}
                                                                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                                placeholder="Ville"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={address.zipCode}
                                                                onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                                                                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500"
                                                                placeholder="Code Postal"
                                                            />
                                                        </div>
                                                        <textarea
                                                            value={address.instructions}
                                                            onChange={e => setAddress({ ...address, instructions: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 min-h-[100px]"
                                                            placeholder="Instructions (Digicode, étage...)"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                {user && (
                                                    <button
                                                        onClick={() => setIsEditingInfo(false)}
                                                        className="flex-1 px-4 py-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                                                    >
                                                        Annuler
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleNext}
                                                    disabled={!customer.firstName || !customer.lastName || !customer.phone}
                                                    className="flex-[2] bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {user ? 'Enregistrer' : 'Suivant'}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 'payment' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-red-500" />
                                            Mode de paiement
                                        </h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    setPaymentMethod('cash');
                                                    setShowStripeForm(false);
                                                    setStripeError(null);
                                                }}
                                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'cash' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Wallet className="w-5 h-5" />
                                                    <div className="text-left">
                                                        <p className="font-bold">Espèces / Carte à la livraison</p>
                                                        <p className="text-xs opacity-70">Payez lors de la récupération</p>
                                                    </div>
                                                </div>
                                                {paymentMethod === 'cash' && <CheckCircle2 className="w-5 h-5" />}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setPaymentMethod('stripe');
                                                    setStripeError(null);
                                                    // Auto-show Stripe form when selecting card payment
                                                    if (!showStripeForm && !clientSecret) {
                                                        createPaymentIntent();
                                                    }
                                                }}
                                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'stripe' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Lock className="w-5 h-5" />
                                                    <div className="text-left">
                                                        <p className="font-bold">Carte Bancaire (En ligne)</p>
                                                        <p className="text-xs opacity-70">Sécurisé par Stripe</p>
                                                    </div>
                                                </div>
                                                {paymentMethod === 'stripe' && <CheckCircle2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {paymentMethod === 'stripe' && showStripeForm && (
                                        <div className="space-y-4">
                                            <StripePaymentForm
                                                onSuccess={handleStripeSuccess}
                                                onError={handleStripeError}
                                                amount={getTotalPrice()}
                                            />
                                        </div>
                                    )}

                                    {stripeError && (
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                            <p className="text-sm text-red-800">{stripeError}</p>
                                        </div>
                                    )}

                                    {paymentMethod === 'stripe' && !showStripeForm && (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                <strong>💳 Mode Test</strong><br />
                                                Utilisez la carte : 4242 4242 4242 4242<br />
                                                Date : 12/25 | CVC : 123
                                            </p>
                                        </div>
                                    )}

                                    {paymentMethod === 'cash' && (
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                            <p className="text-sm text-amber-800 flex items-start gap-2">
                                                <span className="text-lg">💡</span>
                                                En cliquant sur "Commander", vous confirmez votre engagement à récupérer ou recevoir votre commande à l'heure indiquée.
                                            </p>
                                        </div>
                                    )}

                                    {(!showStripeForm || paymentMethod === 'cash') && (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'animate-pulse' : ''
                                                }`}
                                        >
                                            {isSubmitting ? 'Traitement...' : (paymentMethod === 'stripe' ? 'Continuer vers le paiement' : 'Confirmer la commande')}
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Summary */}
                    <div className="lg:w-96 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-red-500" />
                                Résumé du panier
                            </h2>

                            <div className="space-y-4 mb-6">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                                            {item.image && <img src={item.image} className="w-full h-full object-cover" alt={item.name} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.priceOption}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{item.totalPrice.toFixed(2)}€</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total</span>
                                    <span>{getTotalPrice().toFixed(2)}€</span>
                                </div>
                                {orderType === 'delivery' && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Frais de livraison</span>
                                        <span className="text-green-600 font-bold uppercase text-xs">Gratuit</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3">
                                    <span>Total</span>
                                    <span className="text-red-500">{getTotalPrice().toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-gray-900 text-white">
                            <p className="text-xs text-gray-400 mb-1">Besoin d'aide ?</p>
                            <p className="font-bold underline cursor-pointer hover:text-red-400 transition-colors">04 90 94 36 67</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
