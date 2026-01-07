import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchComponents = createAsyncThunk(
  "builder/fetchComponents",
  async ({ category, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/componentspublic", {
        params: { category, ...params, limit: 100 },
      });

     
     
      return { category, data: response.data.components };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
  }
);

const initialState = {
  selected: {
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    case: null, 
    psu: null,
    cooler: null,
  },
  options: {
    cpu: [],
    motherboard: [],
    ram: [],
    gpu: [],
    storage: [],
    case: [],
    psu: [],
    cooler: [],
  },
  totalPrice: 0,
  estimatedWattage: 0,
  loading: false,
  error: null,
};

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    selectPart: (state, action) => {
      
      const { category, component } = action.payload;
      state.selected[category] = component;

      if (category === "cpu") {
        state.selected.motherboard = null;
        state.selected.ram = null;
        state.selected.cooler = null;
        state.options.motherboard = [];
        state.options.cooler = [];
      }
      if (category === "motherboard") {
        state.selected.ram = null;
        state.options.ram = [];
      }

      let price = 0;
      let wattage = 0;
      Object.values(state.selected).forEach((part) => {
        if (part) {
          price += part.price;
          if (part.specs?.wattage) wattage += part.specs.wattage;
        }
      });
      state.totalPrice = price;
      state.estimatedWattage = wattage;
    },
    resetBuild: () => initialState,
    setSelected: (state, action) => {
      state.selected = action.payload;
      let price = 0;
      let wattage = 0;
      Object.values(state.selected).forEach((part) => {
        if (part) {
          price += part.price;
          if (part.specs?.wattage) wattage += part.specs.wattage;
        }
      });
      state.totalPrice = price;
      state.estimatedWattage = wattage;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComponents.fulfilled, (state, action) => {
        state.loading = false;
        const { category, data } = action.payload;
        state.options[category] = data;
      })
      .addCase(fetchComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectPart, setSelected, resetBuild } = builderSlice.actions;
export default builderSlice.reducer;
