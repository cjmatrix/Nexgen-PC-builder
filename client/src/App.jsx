import { useEffect, Suspense, lazy } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "./store/slices/authSlice";
import { fetchAdminProfile } from "./store/slices/adminSlice";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy Component Imports
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
import BlacklistComponents from "./pages/admin/admin pages/blacklist management/BlacklistComponents";
const Wishlist = lazy(
  () =>
    import("./pages/customer/customer pages/user profile/wishlist/Wishlist"),
);
const AdminDashboard = lazy(
  () => import("./pages/admin/layout/AdminDashboard"),
);

const AdminDashboardHome = lazy(
  () => import("./pages/admin/admin pages/admin dashboard/AdminDashboardHome"),
);
const SalesReport = lazy(
  () => import("./pages/admin/admin pages/sales and reporting/SalesReport"),
);
const BlacklistProducts = lazy(
  () =>
    import("./pages/admin/admin pages/blacklist management/BlacklistProducts"),
);
const UserManagement = lazy(
  () => import("./pages/admin/admin pages/user management/UserManagement"),
);
const CreateComponent = lazy(
  () => import("./pages/admin/admin pages/component management/componentForm"),
);
const ComponentManagement = lazy(
  () =>
    import("./pages/admin/admin pages/component management/ComponentManagement"),
);
const ComponentList = lazy(
  () => import("./pages/admin/admin pages/component management/ComponentList"),
);
const CategoryManagement = lazy(
  () =>
    import("./pages/admin/admin pages/category management/CategoryManagement"),
);
const CategoryForm = lazy(
  () => import("./pages/admin/admin pages/category management/CategoryForm"),
);
const CouponManagement = lazy(
  () => import("./pages/admin/admin pages/coupon management/CouponManagement"),
);
const CouponForm = lazy(
  () => import("./pages/admin/admin pages/coupon management/CouponForm"),
);
const PCBuilder = lazy(
  () => import("./pages/customer/customer pages/PCBuilder/PCBuilder"),
);
const ProductManagement = lazy(
  () =>
    import("./pages/admin/admin pages/product management/ProductManagement"),
);
const OrderManagement = lazy(
  () => import("./pages/admin/admin pages/order management/OrderManagement"),
);
const AddProductForm = lazy(
  () => import("./pages/admin/admin pages/product management/ProductForm"),
);
const ProductList = lazy(
  () => import("./pages/customer/customer pages/product list/ProductList"),
);
const ProductDetail = lazy(
  () => import("./pages/customer/customer pages/product detail/ProductDetail"),
);
const AIPCAssistant = lazy(
  () => import("./pages/customer/customer pages/AIpcassistant/AIPCAssistant"),
);
const Deals = lazy(() => import("./pages/customer/customer pages/deals/Deals"));
const Cart = lazy(() => import("./pages/customer/customer pages/cart/Cart"));
const Checkout = lazy(
  () => import("./pages/customer/customer pages/checkout/Checkout"),
);
const AdminRoutes = lazy(() => import("./protectedroutes/AdminRoute"));
const PaymentRetry = lazy(
  () =>
    import("./pages/customer/customer pages/checkout/components/PaymentRetry"),
);

const UserDashboard = lazy(
  () =>
    import("./pages/customer/customer pages/user profile/layout/UserDashboard"),
);

const ProfileSetting = lazy(
  () =>
    import("./pages/customer/customer pages/user profile/profile/ProfileSetting"),
);
const OrderHistory = lazy(
  () =>
    import("./pages/customer/customer pages/user profile/order history/OrderHistory"),
);
const Referral = lazy(
  () => import("./pages/customer/customer pages/user profile/referal/Referral"),
);
const Wallet = lazy(
  () => import("./pages/customer/customer pages/user profile/wallet/Wallet"),
);
const CommunityBuilds = lazy(
  () => import("./pages/customer/customer pages/community/CommunityBuilds"),
);
const NotFound = lazy(() => import("./pages/NotFound"));
const TooManyRequests = lazy(() => import("./pages/TooManyRequests"));

const CustomerPage = lazy(() => import("./pages/customer/layout/CustomerPage"));

const ProtectedRoute = lazy(() => import("./protectedroutes/ProtectedRoute"));

const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <div className="text-sm font-medium text-blue-600 animate-pulse">
        Loading...
      </div>
    </div>
  </div>
);

const Load = (Component) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: Load(LandingPage),
  },
  {
    path: "/login",
    element: Load(Login),
  },
  {
    path: "/signup",
    element: Load(Signup),
  },
  {
    path: "/admin/login",
    element: Load(AdminLogin),
  },
  {
    path: "/forgot-password",
    element: Load(ForgotPassword),
  },
  {
    path: "/reset-password/:resetToken",
    element: Load(ResetPassword),
  },
  {
    path: "/",
    element: Load(CustomerPage),
    children: [
      {
        path: "/products",
        element: Load(ProductList),
      },
      {
        path: "/products/:id",
        element: Load(ProductDetail),
      },
      {
        path: "/products/customization/:id",
        element: Load(PCBuilder),
      },
      {
        path: "/builder",
        element: Load(PCBuilder),
      },
      {
        path: "/deals",
        element: Load(Deals),
      },
      {
        path: "/community-builds",
        element: Load(CommunityBuilds),
      },
      {
        path: "/ai-assistant",
        element: Load(AIPCAssistant),
      },
    ],
  },

  {
    element: Load(AdminRoutes),
    children: [
      {
        path: "/admin",
        element: Load(AdminDashboard),
        children: [
          {
            index: true,
            element: Load(AdminDashboardHome),
          },
          {
            path: "/admin/users",
            element: Load(UserManagement),
          },
          {
            path: "/admin/components/create",
            element: Load(CreateComponent),
          },
          {
            path: "/admin/components/edit/:id",
            element: Load(CreateComponent),
          },
          {
            path: "/admin/components",
            element: Load(ComponentManagement),
          },
          {
            path: "/admin/components/:category",
            element: Load(ComponentList),
          },
          {
            path: "/admin/categories",
            element: Load(CategoryManagement),
          },
          {
            path: "/admin/categories/create",
            element: Load(CategoryForm),
          },
          {
            path: "/admin/categories/edit/:id",
            element: Load(CategoryForm),
          },
          {
            path: "/admin/coupons",
            element: Load(CouponManagement),
          },
          {
            path: "/admin/coupons/create",
            element: Load(CouponForm),
          },
          {
            path: "/admin/coupons/edit/:id",
            element: Load(CouponForm),
          },
          {
            path: "/admin/products",
            element: Load(ProductManagement),
          },
          {
            path: "/admin/orders",
            element: Load(OrderManagement),
          },
          {
            path: "/admin/sales-report",
            element: Load(SalesReport),
          },
          {
            path: "/admin/products/bui",
            element: Load(PCBuilder),
          },
          {
            path: "/admin/products/create",
            element: Load(AddProductForm),
          },
          {
            path: "/admin/products/edit/:id",
            element: Load(AddProductForm),
          },
          {
            path: "/admin/blacklist",
            element: Load(BlacklistProducts),
          },
          {
            path: "/admin/blacklist/:id",
            element: Load(BlacklistComponents),
          },
        ],
      },
    ],
  },
  {
    element: Load(ProtectedRoute),
    children: [
      {
        path: "/",
        element: Load(CustomerPage),
        children: [
          {
            path: "/cart",
            element: Load(Cart),
          },
          {
            path: "/checkout",
            element: Load(Checkout),
          },
          {
            path: "/payment/retry/:orderId",
            element: Load(PaymentRetry),
          },
          {
            path: "/user",
            element: Load(UserDashboard),

            children: [
              {
                path: "/user/profile",
                element: Load(ProfileSetting),
              },
              {
                path: "/user/orders",
                element: Load(OrderHistory),
              },
              {
                path: "/user/referral",
                element: Load(Referral),
              },
              {
                path: "/user/wallet",
                element: Load(Wallet),
              },
              {
                path: "/user/wishlist",
                element: Load(Wishlist),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: Load(NotFound),
  },
  {
    path: "/too-many-requests",
    element: Load(TooManyRequests),
  },
]);

function App() {
  const dispatch = useDispatch();

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
