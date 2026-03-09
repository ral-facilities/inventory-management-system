import { createListenerMiddleware } from '@reduxjs/toolkit';
import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation, setIsAdminMode } from '../slices/authorisationSlice';
import { RootState, StorageRegistry } from '../store';

export const createAuthListenerMiddleware = (
  getUserRoleFn: () => string,
  storageRegistryDict: StorageRegistry
) => {
  const middleware = createListenerMiddleware();

  middleware.startListening({
    type: TokenUpdatedType,
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState() as RootState;
      const privilegedRoles = state.config.settings.privilegedRoles;

      const role = getUserRoleFn();

      listenerApi.dispatch(
        setAuthorisation({
          role,
          isAdminUser: privilegedRoles.includes(role),
        })
      );
    },
  });

  middleware.startListening({
    actionCreator: setIsAdminMode,
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState() as RootState;
      if (state.authorisation.isAdminUser) {
        storageRegistryDict.authorisation.save(state.authorisation.isAdminMode);
      } else {
        storageRegistryDict.authorisation.clear();
      }
    },
  });

  middleware.startListening({
    actionCreator: setAuthorisation,
    effect: async (_, listenerApi) => {
      const { isAdminUser, isAdminMode } = (listenerApi.getState() as RootState)
        .authorisation;
      if (!isAdminUser) {
        storageRegistryDict.authorisation.clear();
      } else {
        storageRegistryDict.authorisation.save(isAdminMode);
      }
    },
  });

  return middleware;
};
