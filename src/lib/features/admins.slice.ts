import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, put, delete: deleteFn } = useRequest();

export type Admin = {
  id: number;
  username: string;
  name: string;
  editing?: boolean;
  adding?: boolean;
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

type UpdateAdminParams = {
  id: number;
  admin: Admin;
};

export const updateAdmin = createAsyncThunk<void, UpdateAdminParams>(
  "admins/update",
  async ({id, admin}: UpdateAdminParams): Promise<void> => {
    const {error} = await put<{}, Admin[]>(`/admins/${id}`, admin);
    if (error) {
      throw error;
    }
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
    [fetchAdmins.pending, updateAdmin.pending, deleteAdmin.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: AdminsState) => {
        state.loading = true;
      });
    });
    [fetchAdmins.rejected, updateAdmin.rejected, deleteAdmin.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: AdminsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("admins slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchAdmins.fulfilled, (state: AdminsState, action: PayloadAction<Admin[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateAdmin.fulfilled, (state: AdminsState, action: PayloadAction<void, string, {arg: UpdateAdminParams}>) => {
      const {id, admin}: UpdateAdminParams = action.meta.arg;
      const targetIndex: number = state.list.findIndex((item: Admin) => item.id === id);
      if (targetIndex > -1) { // targeted
        state.list[targetIndex] = {
          ...state.list[targetIndex],
          ...admin
        };
        state.list = [...state.list];
      }
      state.loading = false;
    });
  }
});

export const {} = adminsSlice.actions;

export default adminsSlice.reducer;
