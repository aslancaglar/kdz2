"use client";
import { useState } from 'react';

interface MockStripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
}

export default function MockStripePaymentForm({ onSuccess, onError, amount }: MockStripePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvc) {
      onError('Veuillez remplir tous les champs');
      return;
    }

    // Simple validation for test cards
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanCardNumber === '4000000000000002') {
      onError('Votre carte a été refusée.');
      return;
    }

    if (!/^\d{16}$/.test(cleanCardNumber) && cleanCardNumber !== '4242424242424242') {
      onError('Numéro de carte invalide');
      return;
    }

    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      onSuccess(mockPaymentIntentId);
      setIsLoading(false);
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 font-medium mb-2">
          💳 Mode Test - Utilisez ces cartes :
        </p>
        <div className="space-y-1 text-xs text-blue-700">
          <p><strong>Paiement réussi :</strong> 4242 4242 4242 4242</p>
          <p><strong>Paiement refusé :</strong> 4000 0000 0000 0002</p>
          <p className="mt-2 text-blue-600">
            Date : 12/25 | CVC : 123
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Numéro de carte</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              className="w-full bg-white border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="24" rx="4" fill="#EBF8FF"/>
                <rect x="4" y="18" width="40" height="6" fill="#4299E1"/>
                <circle cx="32" cy="28" r="3" fill="#ECC94B"/>
                <circle cx="38" cy="28" r="3" fill="#ED8936"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Date d'expiration</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              maxLength={5}
              className="w-full bg-white border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
              placeholder="123"
              maxLength={3}
              className="w-full bg-white border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
        </svg>
        <span>Paiement sécurisé par Stripe</span>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement du paiement...
          </>
        ) : (
          <>
            Payer {amount.toFixed(2)}€
          </>
        )}
      </button>
    </form>
  );
}
