import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, delete: deleteFn } = useRequest();

export type Admin = {
  id: number;
  username: string;
  name: string;
};

interface AdminsState {
  list: Admin[];
  loading: boolean;
}

const initialState: AdminsState = {
  list: [],
  loading: false
};

export const fetchAdmins = createAsyncThunk<Admin[], void>(
  "admins/list",
  async (): Promise<Admin[]> => {
    const {data, error} = await get<{}, Admin[]>("/admins");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

export const deleteAdmin = createAsyncThunk<void, number>(
  "admins/delete",
  async (id: number, thunkApi): Promise<void> => {
    const {error} = await deleteFn(`/admins/${id}`);
    if (error) {
      throw error;
    }
  }
);

export const adminsSlice = createSlice({
  name: "admins",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<AdminsState>) => {
    builder.addCase(fetchAdmins.pending, (state: AdminsState) => {
      state.loading = true;
    });
    builder.addCase(fetchAdmins.fulfilled, (state: AdminsState, action: PayloadAction<Admin[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchAdmins.rejected, (state: AdminsState) => {
      state.loading = true;
    });
  }
});

export const {} = adminsSlice.actions;

export default adminsSlice.reducer;
