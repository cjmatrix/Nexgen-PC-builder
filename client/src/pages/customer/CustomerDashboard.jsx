import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, reset } from "../../store/slices/authSlice";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <a href="#" className="flex items-center py-4 px-2">
                  <span className="font-semibold text-gray-500 text-lg">
                    Nexgen PC Builder
                  </span>
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3 ">
              <button
                onClick={onLogout}
                className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-10 p-4">
        <div className="bg-white p-8 rounded shadow-md">
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {user && user.name}!
          </h1>
          <p className="text-gray-700 text-lg">
            This is your customer dashboard. You can manage your orders and
            profile here.
          </p>
          <div className="mt-6">
            <p className="text-gray-600">More features coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
