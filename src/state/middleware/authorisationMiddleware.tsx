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
          isPrivilegedUser: privilegedRoles.includes(role),
        })
      );
    },
  });

  middleware.startListening({
    actionCreator: setIsAdminMode,
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState() as RootState;
      if (state.authorisation.isPrivilegedUser) {
        storageRegistryDict.authorisation.save(state.authorisation.isAdminMode);
      } else {
        storageRegistryDict.authorisation.clear();
      }
    },
  });

  middleware.startListening({
    actionCreator: setAuthorisation,
    effect: async (_, listenerApi) => {
      const { isPrivilegedUser, isAdminMode } = (
        listenerApi.getState() as RootState
      ).authorisation;
      if (!isPrivilegedUser) {
        storageRegistryDict.authorisation.clear();
      } else {
        storageRegistryDict.authorisation.save(isAdminMode);
      }
    },
  });

  return middleware;
};
