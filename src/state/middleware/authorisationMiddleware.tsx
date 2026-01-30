import { createListenerMiddleware } from '@reduxjs/toolkit';
import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation } from '../slices/authorisationSlice';
import { RootState } from '../store';

export const createAuthListenerMiddleware = (getUserRoleFn: () => string) => {
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

  return middleware;
};
