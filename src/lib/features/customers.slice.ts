import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerTier } from "./customer-tiers.slice";
import { RootState } from "../store";

const { get, post, put, delete: deleteFn } = useRequest();

export type NewCustomer = {
  username: string;
  password: string;
  name: string;
  email: string;
  orgName: string;
  phone: string;
  tierId: number;
};

export interface Customer extends Omit<NewCustomer, "password" | "tierId"> {
  id: number;
  createdAt: Date;
  tier?: CustomerTier;
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

export const createCustomer = createAsyncThunk<void, NewCustomer>(
  "customers/create",
  async (customer: NewCustomer, {dispatch, getState}): Promise<void> => {
    const {error} = await post<NewCustomer>("/customers", customer);
    if (error) {
      throw error;
    }
    dispatch(fetchCustomers());
  }
);

export type UpdatedCustomer = Required<Partial<Omit<Customer, "tier">> & {id: number, tierId?: number}>;

type UpdatedCustomerParams = {
  customer: UpdatedCustomer;
  preCustomer: Customer;
};

export const updateCustomer = createAsyncThunk<Customer, UpdatedCustomerParams>(
  "customers/update",
  async ({customer, preCustomer}: UpdatedCustomerParams, {getState}): Promise<Customer> => {
    const {id, ...updatedCustomer} = customer;
    const {error} = await put<Partial<Customer>>(`/customers/${id}`, updatedCustomer);
    if (error) {
      throw error;
    }
    const customerTiers: CustomerTier[] = (getState() as RootState).customerTiers.list;
    if (updatedCustomer.tierId) {
      const tier: CustomerTier | undefined = customerTiers.find((customerTier: CustomerTier) => customerTier.id === updatedCustomer.tierId);
      if (tier) {
        return {
          ...preCustomer,
          ...updatedCustomer,
          tier: tier
        };
      }
    }
    return {
      ...preCustomer,
      ...updatedCustomer
    };
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
      const index: number = state.list.findIndex((item: Customer | NewCustomer) => !item.hasOwnProperty("id"));
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomersState>) => {
    [fetchCustomers, createCustomer, updateCustomer, deleteCustomer].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: CustomersState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: CustomersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("customers slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomers.fulfilled, (state: CustomersState, action: PayloadAction<Customer[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateCustomer.fulfilled, (state: CustomersState, action: PayloadAction<Customer, string, {arg: UpdatedCustomerParams}>) => {
      const updatedCustomer: Customer = action.payload;
      if (updatedCustomer) {
        const {customer}: UpdatedCustomerParams = action.meta.arg;
        const targetIndex: number = state.list.findIndex((item: Customer) => item.id === customer.id);
        if (targetIndex > -1) { // targeted
          state.list[targetIndex] = {
            ...state.list[targetIndex],
            ...updatedCustomer
          };
          state.list = [...state.list];
        }
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
