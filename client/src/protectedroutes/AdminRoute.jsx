import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const AdminRoutes = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (user && user.role === "admin") {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoutes;
