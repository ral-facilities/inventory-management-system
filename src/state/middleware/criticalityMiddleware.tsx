import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setIsCriticalMode } from '../slices/criticalitySlice';
import { RootState, StorageRegistry } from '../store';

export const createCriticalListenerMiddleware = (
  storageRegistryDict: StorageRegistry
) => {
  const middleware = createListenerMiddleware();

  middleware.startListening({
    actionCreator: setIsCriticalMode,
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState() as RootState;
      storageRegistryDict.criticality.save(state.criticality.isCriticalMode);
    },
  });

  return middleware;
};
