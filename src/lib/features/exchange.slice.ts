import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";

const {get, patch} = useRequest();

interface ExchangeState {
  exchangeRate?: ExhangeRate;
  loading: boolean;
}

const initialState: ExchangeState = {
  loading: false,
  exchangeRate: undefined
};

export type ExhangeRate = {
  id: number;
  rate: number;
  baseCurrencyCode: string;
}
type UpdateExhangeRateParams = ExhangeRate;

export const findExhangeRate = createAsyncThunk<ExhangeRate>(
  "exchange/findExhangeRate",
  async (): Promise<ExhangeRate> => {
    const {error, data} = await get<{}, ExhangeRate>(`/exchange-rates/USD`);
    if (error) {
      throw error;
    } else if (!data) {
      throw new Error("You haven't set the exchange rate yet!");
    }
    return data;
  }
);

export const updateExhangeRate = createAsyncThunk<void, UpdateExhangeRateParams>(
  "exchange/updateExhangeRate",
  async ({id, ...params}: UpdateExhangeRateParams): Promise<void> => {
    const {error} = await patch<Omit<UpdateExhangeRateParams, "id">, {}>(`/exchange-rates/${id}`, params);
    if (error) {
      throw error;
    }
  }
);

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExchangeState>) => {
    [findExhangeRate, updateExhangeRate].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: ExchangeState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: ExchangeState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("exchange slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(findExhangeRate.fulfilled, (state: ExchangeState, action: PayloadAction<ExhangeRate>) => {
      state.exchangeRate = action.payload;
      state.loading = false;
    });
    builder.addCase(updateExhangeRate.fulfilled, (state: ExchangeState, action: PayloadAction<void, string, {arg: UpdateExhangeRateParams}>) => {
      if (state.exchangeRate) {
        const {rate, baseCurrencyCode} = action.meta.arg;
        state.exchangeRate = {
          ...state.exchangeRate,
          rate: rate,
          baseCurrencyCode: baseCurrencyCode
        };
      }
      state.loading = false;
    });
  }
    
});

export const {
} = exchangeSlice.actions;

export default exchangeSlice.reducer;