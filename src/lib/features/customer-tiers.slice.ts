import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, put, delete: deleteFn } = useRequest();

export type CustomerTier = {
  id: number;
  name: string;
  digitalPrintingProfitMargin: number;
  offsetPrintingProfitMargin: number;
  gravurePrintingProfitMargin: number;
  minimumDiscountAmount1: number;
  preferentialProfitMargin1: number;
  minimumDiscountAmount2: number;
  preferentialProfitMargin2: number;
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

type UpdateCustomerTierParams = {
  id: number;
  customerTier: CustomerTier;
};

export const updateCustomerTier = createAsyncThunk<void, UpdateCustomerTierParams>(
  "customer-tiers/update",
  async ({id, customerTier}: UpdateCustomerTierParams): Promise<void> => {
    const {error} = await put<{}, CustomerTier[]>(`/customer-tiers/${id}`, customerTier);
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
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomerTiersState>) => {
    [fetchCustomerTiers.pending, updateCustomerTier.pending, deleteCustomerTier.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: CustomerTiersState) => {
        state.loading = true;
      });
    });
    [fetchCustomerTiers.rejected, updateCustomerTier.rejected, deleteCustomerTier.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: CustomerTiersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("customer tiers slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomerTiers.fulfilled, (state: CustomerTiersState, action: PayloadAction<CustomerTier[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateCustomerTier.fulfilled, (state: CustomerTiersState, action: PayloadAction<void, string, {arg: UpdateCustomerTierParams}>) => {
      const {id, customerTier}: UpdateCustomerTierParams = action.meta.arg;
      const targetIndex: number = state.list.findIndex((item: CustomerTier) => item.id === id);
      if (targetIndex > -1) { // targeted
        state.list[targetIndex] = {
          ...state.list[targetIndex],
          ...customerTier
        };
        state.list = [...state.list];
      }
      state.loading = false;
    });
  }
});

export const {} = customersSlice.actions;

export default customersSlice.reducer;
