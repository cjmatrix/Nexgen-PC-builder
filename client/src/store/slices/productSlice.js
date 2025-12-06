import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchAdminProducts = createAsyncThunk(
  "products/fetchAdmin",
  async ({ page = 1, limit = 10, search = "", category = "", status }, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/products", {
        params: { page, limit, search, category, status },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/products", productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Create failed");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

// Helper to fetch single product for editing
export const fetchProductById = createAsyncThunk(
    "products/fetchById",
    async (id, { rejectWithValue }) => {
      try {
        const response = await api.get(`/admin/products/${id}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    pagination: {},
    loading: false,
    error: null,
    currentProduct: null, // For edit mode
  },
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = {
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          page: action.payload.currentPage,
        };
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
          state.currentProduct = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
         // Optimistic update: remove from list or mark inactive
         const index = state.items.findIndex(p => p._id === action.payload);
         if(index !== -1) state.items[index].isActive = false; 
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;