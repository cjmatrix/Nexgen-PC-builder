import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "./store/slices/authSlice";
import { fetchAdminProfile } from "./store/slices/adminSlice";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminLogin from "./pages/auth/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Wishlist from "./pages/customer/customer pages/user profile/wishlist/Wishlist";
import AdminDashboard from "./pages/admin/layout/AdminDashboard";

import AdminDashboardHome from "./pages/admin/admin pages/admin dashboard/AdminDashboardHome";
import SalesReport from "./pages/admin/admin pages/sales and reporting/SalesReport";
import BlacklistProducts from "./pages/admin/admin pages/blacklist management/BlacklistProducts";
import UserManagement from "./pages/admin/admin pages/user management/UserManagement";
import CreateComponent from "./pages/admin/admin pages/component management/componentForm";
import ComponentManagement from "./pages/admin/admin pages/component management/ComponentManagement";
import CategoryManagement from "./pages/admin/admin pages/category management/CategoryManagement";
import CategoryForm from "./pages/admin/admin pages/category management/CategoryForm";
import CouponManagement from "./pages/admin/admin pages/coupon management/CouponManagement";
import CouponForm from "./pages/admin/admin pages/coupon management/CouponForm";
import PCBuilder from "./pages/customer/customer pages/PCBuilder/PCBuilder";
import ProductManagement from "./pages/admin/admin pages/product management/ProductManagement";
import OrderManagement from "./pages/admin/admin pages/order management/OrderManagement";
import AddProductForm from "./pages/admin/admin pages/product management/ProductForm";
import ProductList from "./pages/customer/customer pages/product list/ProductList";
import ProductDetail from "./pages/customer/customer pages/product detail/ProductDetail";
import AIPCAssistant from "./pages/customer/customer pages/AIpcassistant/AIPCAssistant";
import Deals from "./pages/customer/customer pages/deals/Deals";
import Cart from "./pages/customer/customer pages/cart/Cart";
import Checkout from "./pages/customer/customer pages/checkout/Checkout";
import AdminRoutes from "./protectedroutes/AdminRoute";
import PaymentRetry from "./pages/customer/customer pages/checkout/components/PaymentRetry";

import UserDashboard from "./pages/customer/customer pages/user profile/layout/UserDashboard";

import ProfileSetting from "./pages/customer/customer pages/user profile/profile/ProfileSetting";
import OrderHistory from "./pages/customer/customer pages/user profile/order history/OrderHistory";
import Referral from "./pages/customer/customer pages/user profile/referal/Referral";
import Wallet from "./pages/customer/customer pages/user profile/wallet/Wallet";
import CommunityBuilds from "./pages/customer/customer pages/community/CommunityBuilds";
import NotFound from "./pages/NotFound";

import CustomerPage from "./pages/customer/layout/CustomerPage";

import ProtectedRoute from "./protectedroutes/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:resetToken",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: <CustomerPage></CustomerPage>,
    children: [
      {
        path: "/products",
        element: <ProductList />,
      },
      {
        path: "/products/:id",
        element: <ProductDetail />,
      },
      {
        path: "/products/customization/:id",
        element: <PCBuilder />,
      },
      {
        path: "/builder",
        element: <PCBuilder />,
      },
      {
        path: "/deals",
        element: <Deals />,
      },
      {
        path: "/community-builds",
        element: <CommunityBuilds />,
      },
      {
        path: "/ai-assistant",
        element: <AIPCAssistant />,
      },
    ],
  },

  {
    element: <AdminRoutes />,
    children: [
      {
        path: "/admin",
        element: <AdminDashboard />,
        children: [
          {
            index: true,
            element: <AdminDashboardHome />,
          },
          {
            path: "/admin/users",
            element: <UserManagement />,
          },
          {
            path: "/admin/components/create",
            element: <CreateComponent />,
          },
          {
            path: "/admin/components/edit/:id",
            element: <CreateComponent />,
          },
          {
            path: "/admin/components",
            element: <ComponentManagement />,
          },
          {
            path: "/admin/categories",
            element: <CategoryManagement />,
          },
          {
            path: "/admin/categories/create",
            element: <CategoryForm />,
          },
          {
            path: "/admin/categories/edit/:id",
            element: <CategoryForm />,
          },
          {
            path: "/admin/coupons",
            element: <CouponManagement />,
          },
          {
            path: "/admin/coupons/create",
            element: <CouponForm />,
          },
          {
            path: "/admin/coupons/edit/:id",
            element: <CouponForm />,
          },
          {
            path: "/admin/products",
            element: <ProductManagement />,
          },
          {
            path: "/admin/orders",
            element: <OrderManagement />,
          },
          {
            path: "/admin/sales-report",
            element: <SalesReport />,
          },
          {
            path: "/admin/products/bui",
            element: <PCBuilder />,
          },
          {
            path: "/admin/products/create",
            element: <AddProductForm />,
          },
          {
            path: "/admin/products/edit/:id",
            element: <AddProductForm />,
          },
          {
            path: "/admin/blacklist",
            element: <BlacklistProducts />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <CustomerPage></CustomerPage>,
        children: [
          {
            path: "/cart",
            element: <Cart />,
          },
          {
            path: "/checkout",
            element: <Checkout />,
          },
          {
            path: "/payment/retry/:orderId",
            element: <PaymentRetry></PaymentRetry>,
          },
          {
            path: "/user",
            element: <UserDashboard></UserDashboard>,

            children: [
              {
                path: "/user/profile",
                element: <ProfileSetting></ProfileSetting>,
              },
              {
                path: "/user/orders",
                element: <OrderHistory />,
              },
              {
                path: "/user/referral",
                element: <Referral />,
              },
              {
                path: "/user/wallet",
                element: <Wallet />,
              },
              {
                path: "/user/wishlist",
                element: <Wishlist />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  console.log("heyy");
  useEffect(() => {
    if (window.location.pathname.includes("/admin")) {
      dispatch(fetchAdminProfile());
    } else {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  return (
    <div className="App">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
