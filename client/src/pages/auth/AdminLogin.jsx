import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  adminLogin,
  resetAdmin,
  adminLogout,
} from "../../store/slices/adminSlice";
import { EyeOff, Eye } from "lucide-react";
import CustomModal from "../../components/CustomModal";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { adminUser, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.admin
  );

  console.log(adminUser)
  const [showPassword, setShowPassword] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (isError) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Login Failed",
        message: message,
      });
      dispatch(resetAdmin());
    }
    
    if (isSuccess || adminUser) {
      if (adminUser?.role === "admin") {
        navigate("/admin/components");
      } else if (adminUser) {
        setModalConfig({
          
          isOpen: true,
          type: "error",
          title: "Access Denied",
          message: "You do not have admin privileges.",
        });
        dispatch(adminLogout());
        dispatch(resetAdmin());
      }
    }
  }, [adminUser, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(adminLogin(data));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <div className="bg-white p-8 rounded shadow-md w-96 border-t-4 border-red-600">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Admin Portal
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Admin Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Admin Password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center top-3">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Login to Admin Panel
            </button>
          </div>
        </form>
      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="Okay"
        onConfirm={closeModal}
      />
    </div>
  );
};

export default AdminLogin;
