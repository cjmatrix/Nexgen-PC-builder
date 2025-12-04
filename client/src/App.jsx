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
    ],
  },
  {
    path: "/dashboard",
    element: <CustomerDashboard />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
