import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
}

const initialState: AuthState = {
};

export const login = createAsyncThunk<void, any>(
  "auth/login",
  async (params: any, thunkApi): Promise<void> => {
  }
);

export const logout = createAsyncThunk<void, any>(
  "auth/logout",
  async (params: any, thunkApi): Promise<void> => {
  }
);

export const continueSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {}
});

export const {} = continueSlice.actions;

export default continueSlice.reducer;
