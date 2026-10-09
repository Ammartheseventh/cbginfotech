import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useAddressStore } from './store/useAddressStore';
import { useOrderStore } from './store/useOrderStore';
import Layout from './components/layout/Layout';
import CheckoutLayout from './components/checkout/CheckoutLayout';
import AccountLayout from './components/account/AccountLayout';
import ContentLayout from './components/content/ContentLayout';
import AuthLayout from './components/auth/AuthLayout';
import RequireAuth from './components/auth/RequireAuth';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import CheckoutInformationPage from './pages/checkout/InformationPage';
import CheckoutDeliveryPage from './pages/checkout/DeliveryPage';
import CheckoutReviewPage from './pages/checkout/ReviewPage';
import CheckoutPaymentPage from './pages/checkout/PaymentPage';
import AccountOrdersPage from './pages/account/OrdersPage';
import AccountOrderDetailsPage from './pages/account/OrderDetailsPage';
import AccountAddressesPage from './pages/account/AddressesPage';
import AccountSettingsPage from './pages/account/SettingsPage';
import MissionPage from './pages/content/MissionPage';
import PrivacyPage from './pages/content/PrivacyPage';
import TermsPage from './pages/content/TermsPage';
import ReturnsPage from './pages/content/ReturnsPage';
import ContactPage from './pages/content/ContactPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOrdersListPage from './pages/admin/OrdersListPage';
import AdminOrderDetailPage from './pages/admin/OrderDetailPage';
import RequireAdmin from './components/auth/RequireAdmin';

function App() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const refresh = useAuthStore((s) => s.refresh);

  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const clearAddresses = useAddressStore((s) => s.clear);

  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const clearOrders = useOrderStore((s) => s.clear);

  // Restore the Supabase session on app load.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load addresses and orders when a user logs in, clear them when they log out.
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchAddresses();
      fetchOrders();
    } else {
      clearAddresses();
      clearOrders();
    }
  }, [user, authLoading, fetchAddresses, clearAddresses, fetchOrders, clearOrders]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/account/orders" replace />} />
          <Route path="orders" element={<AccountOrdersPage />} />
          <Route path="orders/:orderId" element={<AccountOrderDetailsPage />} />
          <Route path="addresses" element={<AccountAddressesPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
        </Route>

        <Route path="/about" element={<ContentLayout />}>
          <Route index element={<Navigate to="/about/mission" replace />} />
          <Route path="mission" element={<MissionPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/orders" replace />} />
        <Route path="orders" element={<AdminOrdersListPage />} />
        <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <CheckoutLayout />
          </RequireAuth>
        }
      >
        <Route path="/checkout" element={<CheckoutInformationPage />} />
        <Route path="/checkout/delivery" element={<CheckoutDeliveryPage />} />
        <Route path="/checkout/review" element={<CheckoutReviewPage />} />
        <Route
          path="/checkout/payment/:orderId"
          element={<CheckoutPaymentPage />}
        />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;