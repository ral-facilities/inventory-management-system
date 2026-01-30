import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authListenerMiddleware } from './middleware/authorisationMiddleware';
import authorisationReducer from './slices/authorisationSlice';
import configReducer from './slices/configSlice';

const rootReducer = combineReducers({
  config: configReducer,
  authorisation: authorisationReducer,
});

export function configureAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
  });
}

const store = configureAppStore();
export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export default store;
