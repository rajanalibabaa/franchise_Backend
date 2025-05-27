import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const toggleLikeBrand = createAsyncThunk(
  "likedBrands/toggleLike",
  async (brandId) => {
    const res = await axios.post("/api/investor/toggle-like", { brandId });
    return res.data.likedBrandIds;
  }
);

const likedBrandsSlice = createSlice({
  name: "likedBrands",
  initialState: {
    items: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(toggleLikeBrand.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export default likedBrandsSlice.reducer;
