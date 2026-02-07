import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileStickyCart from './components/MobileStickyCart';
import { OrderProvider } from './context/OrderContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import HolidayNotification from './components/HolidayNotification';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const MenuItemsPage = lazy(() => import('./pages/admin/MenuItemsPage'));
const ToppingsPage = lazy(() => import('./pages/admin/ToppingsPage'));
const ToppingCategoriesPage = lazy(() => import('./pages/admin/ToppingCategoriesPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const ReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'));
const GalleryPage = lazy(() => import('./pages/admin/GalleryPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const PlatformPricesPage = lazy(() => import('./pages/admin/PlatformPricesPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <OrderProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/menu-items"
                  element={
                    <ProtectedRoute>
                      <MenuItemsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/toppings"
                  element={
                    <ProtectedRoute>
                      <ToppingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/topping-categories"
                  element={
                    <ProtectedRoute>
                      <ToppingCategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute>
                      <ReviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/gallery"
                  element={
                    <ProtectedRoute>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/platform-prices"
                  element={
                    <ProtectedRoute>
                      <PlatformPricesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen">
                      <Header />
                      <HolidayNotification />
                      <main>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/menu" element={<MenuPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/account" element={<AccountPage />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                      <MobileStickyCart />
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </OrderProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
