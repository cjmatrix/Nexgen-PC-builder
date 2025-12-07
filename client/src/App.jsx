import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "./store/slices/authSlice";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

import UserManagement from "./pages/admin/components/UserManagement";
import CreateComponent from "./pages/admin/components/componentForm";
import ComponentManagement from "./pages/admin/components/ComponentManagement";
import PCBuilder from "./pages/admin/components/PCBuilder";
import ProductManagement from "./pages/admin/components/ProductManagement";
import AddProductForm from "./pages/admin/components/ProductForm";
import ProductList from "./pages/customer/ProductList";
import AdminRoutes from "./protectedroutes/AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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
    path: "/dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/products",
    element: <ProductList />,
  },
]);

function App() {
  const dispatch = useDispatch();
  console.log('heyy')
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
