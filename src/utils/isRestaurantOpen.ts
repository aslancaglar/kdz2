interface RestaurantHours {
    day: string;
    time: string;
}

interface RestaurantStatus {
    isOpen: boolean;
    nextChange?: string;
}

/**
 * Checks if the restaurant is currently open based on working hours
 * @param hours - Array of restaurant hours from database
 * @returns Object with isOpen status and optional nextChange time
 */
export function isRestaurantOpen(hours: RestaurantHours[] | undefined): RestaurantStatus {
    if (!hours || hours.length === 0) {
        return { isOpen: false };
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Find today's hours (case-insensitive and trim whitespace)
    const todayHours = hours.find(h =>
        h.day.trim().toLowerCase() === currentDay.toLowerCase()
    );

    if (!todayHours) {
        return { isOpen: false };
    }

    // Parse time ranges (e.g., "11:00-14:00, 18:00-22:00" or "11h00 - 15h00 et 17h00 - 00h00" or "Fermé")
    if (todayHours.time.toLowerCase().includes('fermé') || todayHours.time.toLowerCase().includes('ferme')) {
        return { isOpen: false };
    }

    // Normalize the time string: replace 'h' with ':', handle both 'et' and ',' as separators
    const normalizedTime = todayHours.time.replace(/h/gi, ':');

    // Split by 'et', 'and', or comma for multiple time ranges
    const timeRanges = normalizedTime.split(/\s+et\s+|\s+and\s+|,/).map(t => t.trim());

    for (const range of timeRanges) {
        // Parse start and end times - handle formats like "11:00 - 15:00" or "11:00-15:00"
        const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

        if (match) {
            const [, startHour, startMin, endHour, endMin] = match;
            const startTime = parseInt(startHour) * 60 + parseInt(startMin);
            let endTime = parseInt(endHour) * 60 + parseInt(endMin);

            // Handle midnight crossing (e.g., 17:00 - 00:00 means open until midnight)
            if (endTime === 0) {
                endTime = 24 * 60; // Treat 00:00 as end of day
            }

            if (currentTime >= startTime && currentTime <= endTime) {
                return { isOpen: true };
            }
        }
    }

    return { isOpen: false };
}

/**
 * Gets a human-readable status message
 */
export function getStatusMessage(isOpen: boolean): string {
    return isOpen ? 'Ouvert' : 'Fermé';
}
