import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import userReducer from "./slices/userSlice";
import componentReducer from "./slices/componentSlice";
import builderReducer from "./slices/builderSlice";
import productReducer from "./slices/productSlice";
import aiReducer from "./slices/aiSlice";
import cartReducer from "./slices/cartSlice";
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    users: userReducer,
    components: componentReducer,
    builder: builderReducer,
    ai: aiReducer,
    cart: cartReducer,
    products: productReducer,
    notifications: notificationReducer,
    
  },
});
