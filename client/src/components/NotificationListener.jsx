import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAiPc } from "../store/slices/aiSlice";
import { showCustomToast } from "../utils/toastUtils";

import { useNavigate } from "react-router-dom";

const NotificationListener = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/notifications/stream`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("recived", data);
      if (data.type === "connected") return;

      if (data.aiProduct) {
        dispatch(setAiPc(data.aiProduct));
        showCustomToast(data.message, {
          onClick: () => navigate("/ai-assistant"),
        });
      } else {
        showCustomToast(data.message);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user, dispatch]);

  return null;
};

export default NotificationListener;
