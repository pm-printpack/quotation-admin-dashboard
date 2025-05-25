import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth.slice";
import adminsReducer from "./features/admins.slice";
import customersReducer from "./features/customers.slice";
import CustomerLevelsReducer from "./features/customerlevels.slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      admins: adminsReducer,
      customers: customersReducer,
      customerLevels: CustomerLevelsReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

