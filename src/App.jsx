import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
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
import CheckoutConfirmationPage from './pages/checkout/ConfirmationPage';
import AccountOrdersPage from './pages/account/OrdersPage';
import AccountOrderDetailsPage from './pages/account/OrderDetailsPage';
import AccountAddressesPage from './pages/account/AddressesPage';
import AccountSettingsPage from './pages/account/SettingsPage';
import MissionPage from './pages/content/MissionPage';
import PrivacyPage from './pages/content/PrivacyPage';
import TermsPage from './pages/content/TermsPage';
import ReturnsPage from './pages/content/ReturnsPage';
import ContactPage from './pages/content/ContactPage';

function App() {
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
        element={
          <RequireAuth>
            <CheckoutLayout/>
          </RequireAuth>
        }
      >
        <Route path="/checkout" element={<CheckoutInformationPage />} />
        <Route path="/checkout/delivery" element={<CheckoutDeliveryPage />} />
        <Route path="/checkout/review" element={<CheckoutReviewPage />} />
        <Route
          path="/checkout/confirmation/:orderId"
          element={<CheckoutConfirmationPage />}
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