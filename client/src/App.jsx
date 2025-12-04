import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

import UserManagement from "./components/UserManagement";
import CreateComponent from "./pages/CreateComponentPage";
import ComponentManagement from "./components/ComponentManagement";

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
    children:[
      {
        index:true,
        element:<UserManagement/>
      },
      {
        path:'/admin/components/create',
        element:<CreateComponent/>
      },
      {
        path:'/admin/components',
        element:<ComponentManagement/>
      }
    ]
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
