import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
    console.log(isLoading)
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
