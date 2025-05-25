import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerLevel } from "./customerlevels.slice";

const { get, patch, delete: deleteFn } = useRequest();

export type Customer = {
  id: number;
  username: string;
  name: string;
  email: string;
  orgName: string;
  phone: string;
  level: CustomerLevel;
};

interface CustomersState {
  list: Customer[];
  loading: boolean;
}

const initialState: CustomersState = {
  list: [],
  loading: false
};

export const fetchCustomers = createAsyncThunk<Customer[], void>(
  "customers/list",
  async (): Promise<Customer[]> => {
    const {data, error} = await get<{}, Customer[]>("/customers");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

type UpdateCustomerParams = {
  id: number;
  customer: Customer;
};

export const updateCustomer = createAsyncThunk<void, UpdateCustomerParams>(
  "customers/update",
  async ({id, customer}: UpdateCustomerParams): Promise<void> => {
    const {error} = await patch<{}, Customer[]>(`/customers/${id}`, customer);
    if (error) {
      throw error;
    }
  }
);

export const deleteCustomer = createAsyncThunk<void, number>(
  "customers/delete",
  async (id: number, thunkApi): Promise<void> => {
    const {error} = await deleteFn(`/customers/${id}`);
    if (error) {
      throw error;
    }
  }
);

export const customersSlice = createSlice({
  name: "customers",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomersState>) => {
    [fetchCustomers.pending, updateCustomer.pending, deleteCustomer.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: CustomersState) => {
        state.loading = true;
      });
    });
    [fetchCustomers.rejected, updateCustomer.rejected, deleteCustomer.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: CustomersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("admins slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomers.fulfilled, (state: CustomersState, action: PayloadAction<Customer[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateCustomer.fulfilled, (state: CustomersState, action: PayloadAction<void, string, {arg: UpdateCustomerParams}>) => {
          const {id, customer}: UpdateCustomerParams = action.meta.arg;
          const targetIndex: number = state.list.findIndex((item: Customer) => item.id === id);
          if (targetIndex > -1) { // targeted
            state.list[targetIndex] = {
              ...state.list[targetIndex],
              ...customer
            };
            state.list = [...state.list];
          }
          state.loading = false;
        });
  }
});

export const {} = customersSlice.actions;

export default customersSlice.reducer;
