import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";

const {get, patch} = useRequest();

export enum ShippingType {
  OCEAN = "ocean",
  AIR = "air"
}

export const ShippingTypeMapping: Record<ShippingType, string> = {
  [ShippingType.OCEAN]: "海运费单价",
  [ShippingType.AIR]: "空运费单价"
};

export interface Shipping {
  id: number;
  unitPrice: number;
  type: ShippingType;
}

interface ShippingState {
  shippings: Shipping[];
  loading: boolean;
}

const initialState: ShippingState = {
  shippings: [],
  loading: false
};

export const findShippings = createAsyncThunk<Shipping[]>(
  "shippings/findShippings",
  async (): Promise<Shipping[]> => {
    const {error, data} = await get<{}, Shipping[]>(`/shippings`);
    if (error) {
      throw error;
    } else if (!data) {
      throw new Error("You haven't set the exchange rate yet!");
    }
    return data;
  }
);

export const updateShippingUnitPrice = createAsyncThunk<void, { unitPrice: number; type: ShippingType }>(
  "shippings/updateShippingUnitPrice",
  async ({unitPrice, type}): Promise<void> => {
    const {error} = await patch<{ unitPrice: number }, Shipping>(`/shippings/${type}`, {unitPrice});
    if (error) {
      throw error;
    }
  }
);

export const shippingsSlice = createSlice({
  name: "shippings",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<ShippingState>) => {
    [findShippings, updateShippingUnitPrice].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: ShippingState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: ShippingState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("shippings error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(findShippings.fulfilled, (state: ShippingState, action: PayloadAction<Shipping[]>) => {
      state.shippings = action.payload;
      state.loading = false;
    });
    builder.addCase(updateShippingUnitPrice.fulfilled, (state: ShippingState, action: PayloadAction<void, string, {arg: {unitPrice: number; type: ShippingType}}>) => {
      if (state.shippings && state.shippings.length > 0) {
        const {type, unitPrice} = action.meta.arg;
        const shippingIndex: number = state.shippings.findIndex(shipping => shipping.type === type);
        if (shippingIndex !== -1) {
          state.shippings[shippingIndex].unitPrice = unitPrice;
        }
        state.shippings = [...state.shippings];
      }
      state.loading = false;
    });
  }
});

export const {
} = shippingsSlice.actions;

export default shippingsSlice.reducer;