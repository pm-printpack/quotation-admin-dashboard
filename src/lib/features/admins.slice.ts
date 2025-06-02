import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, post, put, delete: deleteFn } = useRequest();

export type NewAdmin = {
  id: number;
  username: string;
  password: string;
  name: string;
};

export interface Admin extends Omit<NewAdmin, "password"> {
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

export type UpdateOrCreatAdminByForm = Partial<Admin> | NewAdmin;

type UpdateOrCreatAdminParams = {
  id: number;
  admin: UpdateOrCreatAdminByForm;
};

export const updateOrCreatAdmin = createAsyncThunk<void, UpdateOrCreatAdminParams>(
  "admins/updateOrCreat",
  async ({id, admin}: UpdateOrCreatAdminParams, {dispatch}): Promise<void> => {
    if (id === -1) {
      const {id, ...newAdmin} = admin as NewAdmin;
      const {error} = await post<Omit<NewAdmin, "id">>("/admins", newAdmin);
      if (error) {
        throw error;
      }
      dispatch(fetchAdmins());
    } else {
      const {error} = await put<Partial<Admin>>(`/admins/${id}`, admin);
      if (error) {
        throw error;
      }
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
          id: -1,
          username: "",
          password: "",
          name: ""
        } as Admin & NewAdmin,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: AdminsState) => {
      const index: number = state.list.findIndex((item: Admin) => item.id === -1);
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<AdminsState>) => {
    [fetchAdmins.pending, updateOrCreatAdmin.pending, deleteAdmin.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: AdminsState) => {
        state.loading = true;
      });
    });
    [fetchAdmins.rejected, updateOrCreatAdmin.rejected, deleteAdmin.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: AdminsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("admins slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchAdmins.fulfilled, (state: AdminsState, action: PayloadAction<Admin[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateOrCreatAdmin.fulfilled, (state: AdminsState, action: PayloadAction<void, string, {arg: UpdateOrCreatAdminParams}>) => {
      const {id, admin}: UpdateOrCreatAdminParams = action.meta.arg;
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
