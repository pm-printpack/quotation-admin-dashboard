import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerLevel } from "./customerlevels.slice";

const { get, delete: deleteFn } = useRequest();

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
    builder.addCase(fetchCustomers.pending, (state: CustomersState) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomers.fulfilled, (state: CustomersState, action: PayloadAction<Customer[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchCustomers.rejected, (state: CustomersState) => {
      state.loading = true;
    });
  }
});

export const {} = customersSlice.actions;

export default customersSlice.reducer;
