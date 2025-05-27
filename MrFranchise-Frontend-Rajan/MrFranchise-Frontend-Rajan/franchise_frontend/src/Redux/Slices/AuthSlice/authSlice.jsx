import { createSlice } from '@reduxjs/toolkit';

// Get token and UUIDs from localStorage
const tokenFromStorage = localStorage.getItem("accessToken");
const investorFromStorage = localStorage.getItem("investorUUID");
const brandFromStorage = localStorage.getItem("brandUUID");

const initialState = {
  investorUUID: investorFromStorage || null,
  brandUUID: brandFromStorage || null,
  AccessToken: tokenFromStorage || null,
  isLogin: !!tokenFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUUIDandTOKEN: (state, action) => {
      const { investorUUID, brandUUID, token } = action.payload;
      state.investorUUID = investorUUID;
      state.brandUUID = brandUUID;
      state.AccessToken = token;
      state.isLogin = true;

      if (token) {
        localStorage.setItem("accessToken", token);
        if (investorUUID) localStorage.setItem("investorUUID", investorUUID);
        if (brandUUID) localStorage.setItem("brandUUID", brandUUID);
      }
    },
    logout: (state) => {
      state.investorUUID = null;
      state.brandUUID = null;
      state.AccessToken = null;
      state.isLogin = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("investorUUID");
      localStorage.removeItem("brandUUID");
    },
  },
});

export const { setUUIDandTOKEN, logout } = authSlice.actions;
export default authSlice.reducer;