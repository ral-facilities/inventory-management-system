import { createListenerMiddleware } from '@reduxjs/toolkit';
import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation, setIsAdminMode } from '../slices/authorisationSlice';
import { RootState, StorageDeps } from '../store';

export const createAuthListenerMiddleware = (
  getUserRoleFn: () => string,
  storage: StorageDeps
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
        storage.saveIsAdminMode(state.authorisation.isAdminMode);
      } else {
        storage.clearIsAdminMode();
      }
    },
  });

  middleware.startListening({
    actionCreator: setAuthorisation,
    effect: async (_, listenerApi) => {
      const { isAdminUser, isAdminMode } = (listenerApi.getState() as RootState)
        .authorisation;
      if (!isAdminUser) {
        storage.clearIsAdminMode();
      } else {
        storage.saveIsAdminMode(isAdminMode);
      }
    },
  });

  return middleware;
};
