import { toast } from "react-toastify";
import CustomToast from "../components/CustomToast";
import { TOAST_DURATION } from "../constants";

export const showCustomToast = (message, options = {}) => {
  const duration = options.duration || TOAST_DURATION;

  toast(
    <CustomToast
      message={message}
      duration={duration}
      onClick={options.onClick}
    />,
    {
      position: "bottom-right",
      autoClose: duration,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false,
      ...options,
      style: {
        background: "#FAF5FF", // purple-50
        color: "#1e293b",
        border: "1px solid #E9D5FF", // purple-200
        borderRadius: "12px",
        padding: "0px",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  );
};
