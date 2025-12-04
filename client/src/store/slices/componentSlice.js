import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // Your custom axios instance

// 1. Async Thunk to Fetch Admin Components
export const fetchAdminComponents = createAsyncThunk(
  "components/fetchAdmin",
  async (
    { page = 1, limit = 10, search = "", category = "", status, sort },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/admin/components`, {
        params: { page, limit, search, category, status, sort },
      });
      return response.data; // Returns { success, data, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch components"
      );
    }
  }
);

// 2. Async Thunk to Soft Delete (Deactivate)
export const deleteComponent = createAsyncThunk(
  "components/delete",
  async (id, { rejectWithValue }) => {
    try {
      // Calls: PUT /api/v1/admin/components/:id with isActive: false
      const response = await api.patch(`/admin/components/${id}/delete`, {
        isActive: false,
      });
      return response.data.data; // Return updated component
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

const componentSlice = createSlice({
  name: "components",
  initialState: {
    items: [], // The list of components
    pagination: {}, // { currentPage, totalPages, etc. }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle Fetch
      .addCase(fetchAdminComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminComponents.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.items = action.payload.components;
        state.pagination = {
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        };
      })
      .addCase(fetchAdminComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle Delete (Optimistic Update)
      .addCase(deleteComponent.fulfilled, (state, action) => {
        // Find the item and update its status to inactive immediately
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default componentSlice.reducer;
