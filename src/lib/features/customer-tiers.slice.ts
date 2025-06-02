import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, post, put, delete: deleteFn } = useRequest();

export type NewCustomerTier = {
  id: number;
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

export type UpdateOrCreatCustomerTierByForm = Partial<CustomerTier> | NewCustomerTier;

type UpdateOrCreatCustomerTierParams = {
  id: number;
  customerTier: UpdateOrCreatCustomerTierByForm;
};

export const updateOrCreatCustomerTier = createAsyncThunk<void, UpdateOrCreatCustomerTierParams>(
  "customer-tiers/updateOrCreat",
  async ({id, customerTier}: UpdateOrCreatCustomerTierParams, {dispatch}): Promise<void> => {
    if (id === -1) { // create a new one
      const {id, ...newCustomerTier} = customerTier as NewCustomerTier;
      const {error} = await post<Omit<NewCustomerTier, "id">>("/customer-tiers", newCustomerTier);
      if (error) {
        throw error;
      }
      dispatch(fetchCustomerTiers());
    } else {
      const {error} = await put<Partial<CustomerTier>>(`/customer-tiers/${id}`, customerTier);
      if (error) {
        throw error;
      }
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
          id: -1,
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
      const index: number = state.list.findIndex((item: CustomerTier) => item.id === -1);
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomerTiersState>) => {
    [fetchCustomerTiers.pending, updateOrCreatCustomerTier.pending, deleteCustomerTier.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: CustomerTiersState) => {
        state.loading = true;
      });
    });
    [fetchCustomerTiers.rejected, updateOrCreatCustomerTier.rejected, deleteCustomerTier.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: CustomerTiersState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("customer tiers slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomerTiers.fulfilled, (state: CustomerTiersState, action: PayloadAction<CustomerTier[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateOrCreatCustomerTier.fulfilled, (state: CustomerTiersState, action: PayloadAction<void, string, {arg: UpdateOrCreatCustomerTierParams}>) => {
      const {id, customerTier}: UpdateOrCreatCustomerTierParams = action.meta.arg;
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
