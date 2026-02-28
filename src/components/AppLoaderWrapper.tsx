"use client";

import { useState, useEffect, useCallback } from 'react';
import Loader from './Loader';

export default function AppLoaderWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const handleLoaderFinished = useCallback(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {loading && <Loader onFinished={handleLoaderFinished} />}
            <div className={`transition-opacity duration-700 ${loading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100 h-auto'}`}>
                {children}
            </div>
        </>
    );
}
