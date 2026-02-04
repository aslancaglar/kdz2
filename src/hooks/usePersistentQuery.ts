import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';

/**
 * A wrapper around Convex's useQuery that persists results to localStorage.
 * This allows the UI to show data immediately on page refresh while Convex re-connects.
 */
export function usePersistentQuery<T>(query: any, args: any): T | undefined {
    let queryName = 'unknown';

    if (typeof query === 'string') {
        queryName = query;
    } else if (query && typeof query === 'object') {
        // Try various ways Convex identifies queries
        queryName = query._queryName || query.name || JSON.stringify(query);
    }

    const cacheKey = `convex_cache_${queryName}_${JSON.stringify(args)}`;

    // Initialize state with data from localStorage if available
    const [data, setData] = useState<T | undefined>(() => {
        try {
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : undefined;
        } catch (e) {
            console.error('Failed to parse persistent cache:', e);
            return undefined;
        }
    });

    const convexData = useQuery(query, args);

    // Update data and localStorage when Convex provides new data
    useEffect(() => {
        if (convexData !== undefined) {
            setData(convexData);
            try {
                localStorage.setItem(cacheKey, JSON.stringify(convexData));
            } catch (e) {
                console.error('Failed to save to persistent cache:', e);
            }
        }
    }, [convexData, cacheKey]);

    return data;
}
