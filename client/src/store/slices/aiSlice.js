import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// Async thunk to generate PC build
export const generatePCBuild = createAsyncThunk(
  "ai/generatePCBuild",
  async (prompt, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ai/generate-pc", { prompt });
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    loading: false,
    aiBuild: null, // This will hold the generated product/recommendation
    error: null,
    success: false,
  },
  reducers: {
    resetAIState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.aiBuild = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePCBuild.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generatePCBuild.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.aiBuild = action.payload.product; // Assuming backend returns { success: true, product: ... }
      })
      .addCase(generatePCBuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetAIState } = aiSlice.actions;
export default aiSlice.reducer;
