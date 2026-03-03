import type { Metadata, Viewport } from 'next';
import '../src/index.css';

import ConvexClientProvider from './ConvexClientProvider';
import { AdminAuthProvider } from '../src/context/AdminAuthContext';
import { AuthProvider } from '../src/context/AuthContext';
import { VideoProvider } from '../src/context/VideoContext';
import { OrderProvider } from '../src/context/OrderContext';

import StoreLayout from './StoreLayout';
export const viewport: Viewport = {
    themeColor: '#B91C1C',
};

export const metadata: Metadata = {
    metadataBase: new URL('https://karadeniz.fr'),
    title: 'Karadeniz - Le vrai goût du kebab',
    description: 'Restaurant de kebab authentique à Florange. Savourez nos kebabs frais et faits maison avec des ingrédients de qualité. Commandez en ligne ou sur place.',
    icons: {
        icon: '/logo_karadeniz.png.webp',
        shortcut: '/logo_karadeniz.png.webp',
        apple: '/logo_karadeniz.png.webp',
    },
    openGraph: {
        title: 'Karadeniz - Le vrai goût du kebab',
        description: 'Restaurant de kebab authentique à Florange. Savourez nos kebabs frais et faits maison avec des ingrédients de qualité.',
        url: 'https://karadeniz.fr/',
        siteName: 'Karadeniz',
        images: [{ url: '/logo_karadeniz.png.webp' }],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Karadeniz - Le vrai goût du kebab',
        description: 'Restaurant de kebab authentique à Florange. Kebabs frais et faits maison.',
        images: ['/logo_karadeniz.png.webp'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ConvexClientProvider>
                    <AdminAuthProvider>
                        <AuthProvider>
                            <VideoProvider>
                                <OrderProvider>
                                    <StoreLayout>
                                        {children}
                                    </StoreLayout>
                                </OrderProvider>
                            </VideoProvider>
                        </AuthProvider>
                    </AdminAuthProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
