import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

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
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch components"
      );
    }
  }
);

export const fetchComponentById = createAsyncThunk(
  "components/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/components/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch component"
      );
    }
  }
);

export const createComponent = createAsyncThunk(
  "components/create",
  async (componentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/components", componentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create component"
      );
    }
  }
);

export const updateComponent = createAsyncThunk(
  "components/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/components/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update component"
      );
    }
  }
);

export const deleteComponent = createAsyncThunk(
  "components/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/components/${id}/delete`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

const componentSlice = createSlice({
  name: "components",
  initialState: {
    items: [],
    pagination: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

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
          page: action.payload.currentPage,
        };
      })
      .addCase(fetchAdminComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchComponentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponentById.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchComponentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createComponent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComponent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createComponent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateComponent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComponent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateComponent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteComponent.fulfilled, (state, action) => {
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
