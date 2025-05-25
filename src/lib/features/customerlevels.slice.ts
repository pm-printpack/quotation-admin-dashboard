import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, put, delete: deleteFn } = useRequest();

export type CustomerLevel = {
  id: number;
  level: string;
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

interface CustomerLevelsState {
  list: CustomerLevel[];
  loading: boolean;
}

const initialState: CustomerLevelsState = {
  list: [],
  loading: false
};

export const fetchCustomerLevels = createAsyncThunk<CustomerLevel[], void>(
  "customer-levels/list",
  async (): Promise<CustomerLevel[]> => {
    const {data, error} = await get<{}, CustomerLevel[]>("/customer-levels");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

type UpdateCustomerLevelParams = {
  id: number;
  customerLevel: CustomerLevel;
};

export const updateCustomerLevel = createAsyncThunk<void, UpdateCustomerLevelParams>(
  "customer-levels/update",
  async ({id, customerLevel}: UpdateCustomerLevelParams): Promise<void> => {
    const {error} = await put<{}, CustomerLevel[]>(`/customer-levels/${id}`, customerLevel);
    if (error) {
      throw error;
    }
  }
);

export const deleteCustomerLevel = createAsyncThunk<void, number>(
  "customer-levels/delete",
  async (id: number, thunkApi): Promise<void> => {
    const {error} = await deleteFn(`/customer-levels/${id}`);
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
  extraReducers: (builder: ActionReducerMapBuilder<CustomerLevelsState>) => {
    [fetchCustomerLevels.pending, updateCustomerLevel.pending, deleteCustomerLevel.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: CustomerLevelsState) => {
        state.loading = true;
      });
    });
    [fetchCustomerLevels.rejected, updateCustomerLevel.rejected, deleteCustomerLevel.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: CustomerLevelsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("admins slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCustomerLevels.fulfilled, (state: CustomerLevelsState, action: PayloadAction<CustomerLevel[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateCustomerLevel.fulfilled, (state: CustomerLevelsState, action: PayloadAction<void, string, {arg: UpdateCustomerLevelParams}>) => {
      const {id, customerLevel}: UpdateCustomerLevelParams = action.meta.arg;
      const targetIndex: number = state.list.findIndex((item: CustomerLevel) => item.id === id);
      if (targetIndex > -1) { // targeted
        state.list[targetIndex] = {
          ...state.list[targetIndex],
          ...customerLevel
        };
        state.list = [...state.list];
      }
      state.loading = false;
    });
  }
});

export const {} = customersSlice.actions;

export default customersSlice.reducer;
