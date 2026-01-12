import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const generatePCBuild = createAsyncThunk(
  "ai/generatePCBuild",
  async (prompt, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ai/generate-pc", { prompt });
      console.log(response.data);
      localStorage.setItem("aiBuild", JSON.stringify(response.data.product));
      return response.data;
    } catch (error) {
      let errorMessage = error.message;
      if (error.response && error.response.data) {
        
        if (error.response.data.error && error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    loading: false,
    aiBuild: JSON.parse(localStorage.getItem("aiBuild")) || null,
    error: null,
    success: false,
  },
  reducers: {
    resetAIState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.aiBuild = null;
      localStorage.removeItem('aiBuild');
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
        state.aiBuild = action.payload.product;
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
