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
      position: "top-right",
      autoClose: duration,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false,
      ...options,
    }
  );
};
