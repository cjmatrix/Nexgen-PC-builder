import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const generatePCBuild = createAsyncThunk(
  "ai/generatePCBuild",
  async (prompt, { rejectWithValue }) => {
    try {
      const response = await axios.post("/ai/generate-pc", { prompt });
    
      // localStorage.setItem("aiBuild", JSON.stringify(response.data.product));
      return response.data;
    } catch (error) {
      let errorMessage = error.message;
      if (error.response?.data) {
        if (typeof error.response.data.message === "object") {
          
          errorMessage =
            error.response.data.error?.message ||
            error.response.data.message ||
            JSON.stringify(error.response.data);
        } else if (typeof error.response.data.message === "string") {
          try {
            const parsed = JSON.parse(error.response.data.message);

            errorMessage = parsed.error.message;
            return rejectWithValue(errorMessage);
          } catch (e) {
            errorMessage = error.response.data;
          }
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
    message: "",
    showPromptBar: true,
  },
  reducers: {
    resetAIState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.aiBuild = null;
      state.showPromptBar = true;
      localStorage.removeItem("aiBuild");
    },
    setAiPc: (state, action) => {
      localStorage.setItem("aiBuild", JSON.stringify(action.payload));
      state.aiBuild = action.payload; 
    },
    setError:(state,action)=>{
   
      state.error=action.payload;
      state.showPromptBar= true;
    },
    setShowPromptBar: (state, action) => {
      state.showPromptBar = action.payload;
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
        state.message = action.payload.message;
      })
      .addCase(generatePCBuild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetAIState, setAiPc, setShowPromptBar,setError } = aiSlice.actions;
export default aiSlice.reducer;
