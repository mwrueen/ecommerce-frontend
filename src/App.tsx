import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerAuth from "./pages/CustomerAuth";
import CustomerProfile from "./pages/CustomerProfile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import ProductForm from "./pages/admin/ProductForm";
import ProductDetails from "./pages/admin/ProductDetails";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import CategoryForm from "./pages/admin/CategoryForm";
import UsersManagement from "./pages/admin/UsersManagement";
import UserDetails from "./pages/admin/UserDetails";
import Profile from "./pages/admin/Profile";
import RolesManagement from "./pages/admin/RolesManagement";
import RoleForm from "./pages/admin/RoleForm";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import Settings from "./pages/admin/Settings";
import InventoryManagement from "./pages/admin/InventoryManagement";
import PurchaseManagement from "./pages/admin/PurchaseManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import OrderDetails from "./pages/admin/OrderDetails";
import CustomersManagement from "./pages/admin/CustomersManagement";
import CustomerDetails from "./pages/admin/CustomerDetails";
import Notifications from "./pages/admin/Notifications";
import CouponsManagement from "./pages/admin/CouponsManagement";
import CouponForm from "./pages/admin/CouponForm";
import CouponDetails from "./pages/admin/CouponDetails";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:identifier" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/customer/login" element={<CustomerAuth />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
          </Route>
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="products/create" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="categories/create" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="purchases" element={<PurchaseManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="customers" element={<CustomersManagement />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="roles" element={<RolesManagement />} />
            <Route path="roles/create" element={<RoleForm />} />
            <Route path="roles/:id/edit" element={<RoleForm />} />
            <Route path="permissions" element={<PermissionsManagement />} />
            <Route path="coupons" element={<CouponsManagement />} />
            <Route path="coupons/new" element={<CouponForm />} />
            <Route path="coupons/:id" element={<CouponDetails />} />
            <Route path="coupons/:id/edit" element={<CouponForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
