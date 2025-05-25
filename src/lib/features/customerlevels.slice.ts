import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, delete: deleteFn } = useRequest();

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
    builder.addCase(fetchCustomerLevels.pending, (state: CustomerLevelsState) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomerLevels.fulfilled, (state: CustomerLevelsState, action: PayloadAction<CustomerLevel[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchCustomerLevels.rejected, (state: CustomerLevelsState) => {
      state.loading = true;
    });
  }
});

export const {} = customersSlice.actions;

export default customersSlice.reducer;
