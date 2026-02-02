import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/admin/login", userData);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, thunkAPI) => {
    try {
      await api.post("/auth/admin/logout");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchAdminProfile = createAsyncThunk(
  "admin/fetchAdminProfile",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/auth/admin/profile");
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  adminUser: null,
  isError: false,
  isSuccess: false,
  isLoading: true,
  message: "",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdmin: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.adminUser = action.payload;
        state.message = "";
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.adminUser = null;
      })
      .addCase(adminLogout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isLoading = false;
        state.adminUser = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminUser = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
       
        state.isLoading = false;
       
      
        state.adminUser = null;
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
