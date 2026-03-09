import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authorisationStorage, criticalityStorage } from '../common/storage';
import { getUserRole } from '../parseTokens';
import { createAuthListenerMiddleware } from './middleware/authorisationMiddleware';
import { createCriticalListenerMiddleware } from './middleware/criticalityMiddleware';
import authorisationReducer, {
  initialState as initialAuthSlice,
} from './slices/authorisationSlice';
import configReducer from './slices/configSlice';
import criticalityReducer, {
  initialState as initialCriticalState,
} from './slices/criticalitySlice';

const storageRegistry = {
  authorisation: authorisationStorage,
  criticality: criticalityStorage,
};

export type StorageRegistry = typeof storageRegistry;

const rootReducer = combineReducers({
  config: configReducer,
  authorisation: authorisationReducer,
  criticality: criticalityReducer,
});

export function configureAppStore(
  preloadedState?: Partial<RootState>,
  getUserRoleFn: () => string = getUserRole,
  storageRegistryDict: StorageRegistry = storageRegistry
) {
  const authListenerMiddleware = createAuthListenerMiddleware(
    getUserRoleFn,
    storageRegistryDict
  );

  const criticalityListenerMiddleware =
    createCriticalListenerMiddleware(storageRegistryDict);

  // hydrate admin mode safely
  const hydratedIsAdminMode = storageRegistryDict.authorisation.load();
  const hydratedIsCriticalMode = storageRegistryDict.criticality.load();

  const mergedPreloaded: Partial<RootState> = {
    ...preloadedState,
    authorisation: {
      ...(preloadedState?.authorisation ?? {}),
      ...(hydratedIsAdminMode !== undefined
        ? { isAdminMode: hydratedIsAdminMode }
        : {}),
    } as typeof initialAuthSlice,
    criticality: {
      ...(preloadedState?.criticality ?? {}),
      ...((hydratedIsCriticalMode !== undefined
        ? { isCriticalMode: hydratedIsCriticalMode }
        : {}) as typeof initialCriticalState),
    },
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState: mergedPreloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(authListenerMiddleware.middleware)
        .prepend(criticalityListenerMiddleware.middleware),
  });
}

const store = configureAppStore();
export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export default store;
