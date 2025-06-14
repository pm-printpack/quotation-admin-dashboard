import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, post, put, delete: deleteFn } = useRequest();

export type NewAdmin = {
  username: string;
  password: string;
  name: string;
};

export interface Admin extends Omit<NewAdmin, "password"> {
  id: number;
  createdAt: Date;
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

export const createAdmin = createAsyncThunk<void, NewAdmin>(
  "admins/create",
  async (admin: NewAdmin, {dispatch}): Promise<void> => {
    const {error} = await post<NewAdmin>("/admins", admin);
    if (error) {
      throw error;
    }
    dispatch(fetchAdmins());
  }
);

export const updateAdmin = createAsyncThunk<void, Admin>(
  "admins/update",
  async ({id, ...admin}: Admin): Promise<void> => {
    const {error} = await put<Partial<Admin>>(`/admins/${id}`, admin);
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
    addRecord: (state: AdminsState) => {
      state.list = [
        {
          username: "",
          password: "",
          name: ""
        } as Admin & NewAdmin,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: AdminsState) => {
      const index: number = state.list.findIndex((item: Admin | NewAdmin) => !item.hasOwnProperty("id"));
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<AdminsState>) => {
    [fetchAdmins, createAdmin, updateAdmin, deleteAdmin].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: AdminsState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: AdminsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("admins slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchAdmins.fulfilled, (state: AdminsState, action: PayloadAction<Admin[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateAdmin.fulfilled, (state: AdminsState, action: PayloadAction<void, string, {arg: Admin}>) => {
      const {id, ...admin}: Admin = action.meta.arg;
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

export const {
  addRecord,
  deleteAddingRecord
} = adminsSlice.actions;

export default adminsSlice.reducer;
