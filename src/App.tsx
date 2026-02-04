import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import { OrderProvider } from './context/OrderContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import MenuItemsPage from './pages/admin/MenuItemsPage';
import ToppingsPage from './pages/admin/ToppingsPage';
import ToppingCategoriesPage from './pages/admin/ToppingCategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import GalleryPage from './pages/admin/GalleryPage';
import SettingsPage from './pages/admin/SettingsPage';

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
        <OrderProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardPage />
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
              path="*"
              element={
                <div className="min-h-screen">
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/menu" element={<MenuPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </OrderProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
