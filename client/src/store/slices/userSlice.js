import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../api/axios";

export const getUsers = createAsyncThunk(
  "users/getAll",
  async ({ page, limit, search }, thunkAPI) => {
    try {
      const response = await api.get(
        `/admin/users?page=${page}&limit=${limit}&search=${search}`
      );
      console.log(response.data);
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
  }
);

export const blockUser = createAsyncThunk(
  "users/block",
  async (id, thunkAPI) => {
    try {
      const response = await api.patch(`/admin/users/${id}/block`);

      console.log(response.data);
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
  }
);

export const updateUser = createAsyncThunk(
  "users.updateUser",
  async ({ id, updateObj }) => {
    try {
      const response = await api.put(`/admin/users/${id}/update`, updateObj);
      console.log(response.data);

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
  }
);

const initialState = {
  users: [],
  page: 1,
  totalPages: 1,
  totalUsers: 0,
  search: "",
  isLoading: false,
  isError: false,
  message: "",
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1; // Reset to page 1 on new search
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.totalUsers = action.payload.totalUsers;
        state.page = action.payload.page;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        // Update the user in the list

        const index = state.users.findIndex(
          (user) => user._id === action.payload.user._id
        );
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user._id === action.payload.user._id
        );
        state.users[index] = action.payload.user;

        console.log("heyy");
      });
  },
});

export const { reset, setSearch, setPage } = userSlice.actions;
export default userSlice.reducer;
