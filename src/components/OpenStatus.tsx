import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Clock } from 'lucide-react';
import { isRestaurantOpen, getStatusMessage } from '../utils/isRestaurantOpen';

interface OpenStatusProps {
    isScrolled?: boolean;
    variant?: 'desktop' | 'mobile';
}

export default function OpenStatus({ isScrolled = false, variant = 'desktop' }: OpenStatusProps) {
    const restaurantInfo = useQuery(api.restaurantInfo.get);
    const [currentStatus, setCurrentStatus] = useState({ isOpen: false });

    // Update status every minute
    useEffect(() => {
        const updateStatus = () => {
            if (restaurantInfo) {
                const status = isRestaurantOpen(restaurantInfo.hours, restaurantInfo.holidays);
                setCurrentStatus(status);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [restaurantInfo]);

    if (!restaurantInfo) {
        return null;
    }

    const statusMessage = getStatusMessage(currentStatus);

    // Mobile variant (for mobile menu)
    if (variant === 'mobile') {
        return (
            <div className="flex items-center justify-center gap-2 py-2 mb-2">
                <Clock className={`w-4 h-4 ${currentStatus.isOpen ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white font-semibold text-sm">
                    {statusMessage}
                </span>
            </div>
        );
    }

    // Desktop variant
    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isScrolled
                ? 'bg-white/10 backdrop-blur-sm'
                : 'bg-white/20 backdrop-blur-sm'
                }`}
        >
            <Clock className={`w-4 h-4 ${currentStatus.isOpen ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-white font-semibold text-sm">
                {statusMessage}
            </span>
        </div>
    );
}
