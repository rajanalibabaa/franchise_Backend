import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    firstName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    brandName: "",
    companyName: "",
    category: "",
    franchiseType: "",
  },
  errors: {},
};

const brandRegisterSlice = createSlice({
  name: "brandRegister",
  initialState,
  reducers: {
    setField: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },

    setErrors: (state, action) => {
      state.errors = action.payload;
    },
    resetForm: (state) => {
      state.formData = {
        firstName: "",
        countryCode: "+91",
        phone: "",
        email: "",
        brandName: "",
        companyName: "",
        category: "",
        franchiseType: "",
      };
      state.errors = {};
    },
  },
});

export const { setField, setErrors, resetForm } = brandRegisterSlice.actions;
export default brandRegisterSlice.reducer;