import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, post, put, delete: deleteFn } = useRequest();

export type NewCustomerTier = {
  name: string;
  digitalPrintingProfitMargin: number;
  offsetPrintingProfitMargin: number;
  gravurePrintingProfitMargin: number;
  minimumDiscountAmount1: number;
  preferentialProfitMargin1: number;
  minimumDiscountAmount2: number;
  preferentialProfitMargin2: number;
}

export interface CustomerTier extends NewCustomerTier {
  id: number;
  createdAt: Date;
  isArchived: boolean;
  archivedAt?: Date;
};

interface CustomerTiersState {
  list: CustomerTier[];
  loading: boolean;
}

const initialState: CustomerTiersState = {
  list: [],
  loading: false
};

export const fetchCustomerTiers = createAsyncThunk<CustomerTier[], void>(
  "customer-tiers/list",
  async (): Promise<CustomerTier[]> => {
    const {data, error} = await get<{}, CustomerTier[]>("/customer-tiers");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

export const createCustomerTier = createAsyncThunk<void, NewCustomerTier>(
  "customer-tiers/create",
  async (customerTier: NewCustomerTier, {dispatch}): Promise<void> => {
    const {error} = await post<NewCustomerTier>("/customer-tiers", customerTier);
    if (error) {
      throw error;
    }
    dispatch(fetchCustomerTiers());
  }
);

export const updateCustomerTier = createAsyncThunk<void, Required<Partial<CustomerTier> & {id: number}>>(
  "customer-tiers/update",
  async ({id, ...customerTier}: Required<Partial<CustomerTier> & {id: number}>, {dispatch}): Promise<void> => {
    const {error} = await put<Partial<CustomerTier>>(`/customer-tiers/${id}`, customerTier);
    if (error) {
      throw error;
    }
  }
);

export const deleteCustomerTier = createAsyncThunk<void, number>(
  "customer-tiers/delete",
  async (id: number, thunkApi): Promise<void> => {
    const {error} = await deleteFn(`/customer-tiers/${id}`);
    if (error) {
      throw error;
    }
  }
);

export const customersSlice = createSlice({
  name: "customerTiers",
  initialState: initialState,
  reducers: {
    addRecord: (state: CustomerTiersState) => {
      state.list = [
        {
          digitalPrintingProfitMargin: 0,
          offsetPrintingProfitMargin: 0,
          gravurePrintingProfitMargin: 0,
          minimumDiscountAmount1: 0,
          preferentialProfitMargin1: 0,
          minimumDiscountAmount2: 0,
          preferentialProfitMargin2: 0
        } as CustomerTier,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: CustomerTiersState) => {
      const index: number = state.list.findIndex((item: CustomerTier | NewCustomerTier) => !item.hasOwnProperty("id"));
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomerTiersState>) => {
    [fetchCustomerTiers, createCustomerTier, updateCustomerTier, deleteCustomerTier].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: CustomerTiersState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: CustomerTiersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("customer tiers slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomerTiers.fulfilled, (state: CustomerTiersState, action: PayloadAction<CustomerTier[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateCustomerTier.fulfilled, (state: CustomerTiersState, action: PayloadAction<void, string, {arg: Required<Partial<CustomerTier> & {id: number}>}>) => {
      const {id, ...customerTier}: CustomerTier = action.meta.arg;
      if (id !== -1) {
        const targetIndex: number = state.list.findIndex((item: CustomerTier) => item.id === id);
        if (targetIndex > -1) { // targeted
          state.list[targetIndex] = {
            ...state.list[targetIndex],
            ...customerTier
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
