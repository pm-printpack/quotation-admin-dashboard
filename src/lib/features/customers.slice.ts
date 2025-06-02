import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CustomerTier } from "./customer-tiers.slice";
import { RootState } from "../store";

const { get, post, put, delete: deleteFn } = useRequest();

type NewCustomer = {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  orgName: string;
  phone: string;
  tier: number;
};

export interface Customer extends Omit<NewCustomer, "password" | "tier"> {
  createdAt: Date;
  tier?: CustomerTier;
};

interface UpdatedCustomerByForm extends Omit<Customer, "tier"> {
  tier: number;
}

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

export type UpdatedOrCreatCustomerByForm = Partial<UpdatedCustomerByForm> | NewCustomer;

type UpdateOrCreatCustomerParams = {
  id: number;
  customer: UpdatedOrCreatCustomerByForm
};

export const updateOrCreatCustomer = createAsyncThunk<Customer | undefined, UpdateOrCreatCustomerParams>(
  "customers/updateOrCreat",
  async ({id, customer}: UpdateOrCreatCustomerParams, {dispatch, getState}): Promise<Customer | undefined> => {
    if (id === -1) { // create a new one
      const {id, ...newCustomer} = customer as NewCustomer;
      const {error} = await post<Omit<NewCustomer, "id">>("/customers", newCustomer);
      if (error) {
        throw error;
      }
      dispatch(fetchCustomers());
    } else {
      const {error} = await put<Partial<UpdatedCustomerByForm>>(`/customers/${id}`, customer);
      if (error) {
        throw error;
      }
      const updatedCustomerByForm: UpdatedCustomerByForm = customer as UpdatedCustomerByForm;
      const customerTiers: CustomerTier[] = (getState() as RootState).customerTiers.list;
      if (typeof updatedCustomerByForm.tier === "number") {
        const tier: CustomerTier | undefined = customerTiers.find((customerTier: CustomerTier) => customerTier.id === updatedCustomerByForm.tier);
        if (tier) {
          return {
            ...updatedCustomerByForm,
            tier: tier
          }; 
        } else {
          dispatch(fetchCustomers());
        }
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
    [fetchCustomers, updateOrCreatCustomer, deleteCustomer].forEach((asyncThunk) => {
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
    builder.addCase(updateOrCreatCustomer.fulfilled, (state: CustomersState, action: PayloadAction<Customer | undefined, string, {arg: UpdateOrCreatCustomerParams}>) => {
      const updatedCustomer: Customer | undefined = action.payload;
      if (updatedCustomer) {
        const {id}: UpdateOrCreatCustomerParams = action.meta.arg;
        const targetIndex: number = state.list.findIndex((item: Customer) => item.id === id);
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
