import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const AdminRoutes = () => {
  const { adminUser, isLoading } = useSelector((state) => state.admin);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (adminUser && adminUser.role === "admin") {
    return <Outlet />;
  } else {
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminRoutes;
