import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import componentReducer from "./slices/componentSlice";
import builderReducer from "./slices/builderSlice";
import productReducer from "./slices/productSlice";
import aiReducer from "./slices/aiSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    components: componentReducer,
    builder: builderReducer,
    ai: aiReducer,
    cart: cartReducer,
    products: productReducer,
  },
});
