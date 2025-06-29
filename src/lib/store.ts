import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth.slice";
import adminsReducer from "./features/admins.slice";
import customersReducer from "./features/customers.slice";
import customerTiersReducer from "./features/customer-tiers.slice";
import materialsReducer from "./features/materials.slice";
import exchangeReducer from "./features/exchange.slice";
import quotationHistoriesReducer from "./features/quotation-histories.slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      admins: adminsReducer,
      customers: customersReducer,
      customerTiers: customerTiersReducer,
      materials: materialsReducer,
      exchange: exchangeReducer,
      quotationHistories: quotationHistoriesReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

