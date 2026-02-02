import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  clearIsAdminMode,
  loadIsAdminMode,
  saveIsAdminMode,
} from '../common/storage';
import { getUserRole } from '../parseTokens';
import { createAuthListenerMiddleware } from './middleware/authorisationMiddleware';
import authorisationReducer, {
  initialState as authInitialSlice,
} from './slices/authorisationSlice';
import configReducer from './slices/configSlice';

export interface StorageDeps {
  loadIsAdminMode: () => boolean | undefined;
  saveIsAdminMode: (v: boolean) => void;
  clearIsAdminMode: () => void;
}

const authorisationStorage: StorageDeps = {
  loadIsAdminMode,
  saveIsAdminMode,
  clearIsAdminMode,
};

const rootReducer = combineReducers({
  config: configReducer,
  authorisation: authorisationReducer,
});

export function configureAppStore(
  preloadedState?: Partial<RootState>,
  getUserRoleFn: () => string = getUserRole,
  storageDeps: StorageDeps = authorisationStorage
) {
  const authListenerMiddleware = createAuthListenerMiddleware(
    getUserRoleFn,
    storageDeps
  );

  // hydrate admin mode safely
  const hydratedIsAdminMode = storageDeps.loadIsAdminMode();

  const mergedPreloaded: Partial<RootState> = {
    ...preloadedState,
    authorisation: {
      ...(preloadedState?.authorisation ?? {}),
      ...(hydratedIsAdminMode !== undefined
        ? { isAdminMode: hydratedIsAdminMode }
        : {}),
    } as typeof authInitialSlice,
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState: mergedPreloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
  });
}

const store = configureAppStore();
export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export default store;
