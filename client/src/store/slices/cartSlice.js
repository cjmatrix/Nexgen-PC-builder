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
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/add", { productId, quantity });
      return response.data;
    } catch (error) {
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

const initialState = {
  items: [],
  loading: false,
  error: null,
  summary: {},
};


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.summary = {};
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
        console.log(state.summary)
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
