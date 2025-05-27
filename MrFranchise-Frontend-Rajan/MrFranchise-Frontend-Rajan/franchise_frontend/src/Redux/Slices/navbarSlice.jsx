import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  sidebarView: false,
  menuOpen: false,
  userData:null,
};

const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
    },
    toggleSidebar: (state, action) => {
      state.sidebarView = action.payload;
    },
    toggleMenu: (state, action) => {
      state.menuOpen = typeof action.payload === "boolean" ? action.payload : !state.menuOpen;
    },
  },
});

export const { loginSuccess, logout, toggleSidebar, toggleMenu } = navbarSlice.actions;
export default navbarSlice.reducer;