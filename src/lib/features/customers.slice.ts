import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerTier } from "./customer-tiers.slice";

const { get, post, put, delete: deleteFn } = useRequest();

type NewCustomer = {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  orgName: string;
  phone: string;
  tier: CustomerTier;
};

export interface Customer extends Omit<NewCustomer, "password"> {
  createdAt: Date;
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

type UpdateOrCreatCustomerParams = {
  id: number;
  customer: Customer | NewCustomer;
};

export const updateOrCreatCustomer = createAsyncThunk<void, UpdateOrCreatCustomerParams>(
  "customers/updateOrCreat",
  async ({id, customer}: UpdateOrCreatCustomerParams, {dispatch}): Promise<void> => {
    if (id === -1) { // create a new one
      const {id, ...newCustomer} = customer as NewCustomer;
      const {error} = await post<Omit<NewCustomer, "id">>("/customers", newCustomer);
      if (error) {
        throw error;
      }
      dispatch(fetchCustomers());
    } else {
      const {error} = await put<Partial<Customer>>(`/customers/${id}`, customer);
      if (error) {
        throw error;
      }
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
    addRecord: (state: CustomersState) => {
      state.list = [
        {
          id: -1,
          username: "",
          password: "",
          name: "",
          email: "",
          orgName: "",
          phone: "",
          tier: {}
        } as Customer & NewCustomer,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: CustomersState) => {
      const index: number = state.list.findIndex((item: Customer) => item.id === -1);
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomersState>) => {
    [fetchCustomers.pending, updateOrCreatCustomer.pending, deleteCustomer.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: CustomersState) => {
        state.loading = true;
      });
    });
    [fetchCustomers.rejected, updateOrCreatCustomer.rejected, deleteCustomer.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: CustomersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("customers slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomers.fulfilled, (state: CustomersState, action: PayloadAction<Customer[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateOrCreatCustomer.fulfilled, (state: CustomersState, action: PayloadAction<void, string, {arg: UpdateOrCreatCustomerParams}>) => {
      const {id, customer}: UpdateOrCreatCustomerParams = action.meta.arg;
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

export const {
  addRecord,
  deleteAddingRecord
} = customersSlice.actions;

export default customersSlice.reducer;
