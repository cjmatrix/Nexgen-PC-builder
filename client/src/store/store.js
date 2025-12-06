import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import componentReducer from './slices/componentSlice'
import builderReducer from './slices/builderSlice';
import productReducer from './slices/productSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    components:componentReducer,
    builder: builderReducer,
    products:productReducer,
  },
});
