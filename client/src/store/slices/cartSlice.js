import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity ,customBuild}, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/add", { productId, quantity ,customBuild});
      return response.data;
    } catch (error) {
      console.log(error.response.data)
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item"
      );
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put("/cart/update", { productId, quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update quantity"
      );
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (couponCode, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/apply-coupon", { couponCode });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply coupon"
      );
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/cart/remove-coupon");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove coupon"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  summary: {},
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.summary = {};
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items;
        state.coupon = action.payload.cart.coupon;

        state.summary = action.payload.summary;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        state.summary = action.payload.summary;
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        state.summary = action.payload.summary;
      })

      // Update
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        state.summary = action.payload.summary;
        console.log(state.summary);
      })

      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        state.summary = action.payload.summary;
        state.coupon = action.payload.cart.coupon;
      })

      // Remove Coupon
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        state.summary = action.payload.summary;
        state.coupon = null;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
