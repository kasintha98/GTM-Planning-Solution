import { configureStore } from "@reduxjs/toolkit";
import plansReducer from "./slices/plansSlice";
import kpisReducer from "./slices/kpisSlice";
import forecastsReducer from "./slices/forecastsSlice";

export const store = configureStore({
  reducer: {
    plans: plansReducer,
    kpis: kpisReducer,
    forecasts: forecastsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
//store combines feature slices. Components dispatch thunks
// exported by these slices like fetchPlans to perform async API calls
// and update the central state.
