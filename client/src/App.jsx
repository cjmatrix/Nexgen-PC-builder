import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "./store/slices/authSlice";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

import UserManagement from "./pages/admin/components/UserManagement";
import CreateComponent from "./pages/admin/components/componentForm";
import ComponentManagement from "./pages/admin/components/ComponentManagement";
import PCBuilder from "./pages/customer/PCBuilder";
import ProductManagement from "./pages/admin/components/ProductManagement";
import OrderManagement from "./pages/admin/components/OrderManagement";
import AddProductForm from "./pages/admin/components/ProductForm";
import ProductList from "./pages/customer/ProductList";
import ProductDetail from "./pages/customer/ProductDetail";
import AIPCAssistant from "./pages/customer/AIPCAssistant";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import AdminRoutes from "./protectedroutes/AdminRoute";

import UserDashboard from "./pages/customer/user profile/UserDashboard";

import ProfileSetting from "./pages/customer/user profile/components/ProfileSetting";
import OrderHistory from "./pages/customer/user profile/components/OrderHistory";

import CustomerPage from "./pages/customer/CustomerPage";

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
    element: <AdminRoutes />,
    children: [
      {
        path: "/admin",
        element: <AdminDashboard />,
        children: [
          {
            index: true,
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
            path: "/admin/products",
            element: <ProductManagement />,
          },
          {
            path: "/admin/orders",
            element: <OrderManagement />,
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
            path: "/dashboard",
            element: <CustomerDashboard />,
          },
          {
            path: "/products",
            element: <ProductList />,
          },
          {
            path: "/products/:id",
            element: <ProductDetail />,
          },
          {
            path: "/ai-assistant",
            element: <AIPCAssistant />,
          },
          {
            path: "/builder",
            element: <PCBuilder />,
          },
          {
            path: "/products/customization/:id",
            element: <PCBuilder />,
          },
          {
            path: "/cart",
            element: <Cart />,
          },
          {
            path: "/checkout",
            element: <Checkout />,
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
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  console.log("heyy");
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
