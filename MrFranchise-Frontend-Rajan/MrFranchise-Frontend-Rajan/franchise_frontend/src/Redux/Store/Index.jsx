import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../Slices/AuthSlice/authSlice";
import navReducer from "../Slices/navbarSlice";
import likedBrandsSlice from "../Slices/LikedBrandSlices/LikedBrandSlice"

 const store = configureStore({
  reducer: {
    navbar:navReducer,
    auth: authReducer,
    likedBrands : likedBrandsSlice
  },
});
export default store;