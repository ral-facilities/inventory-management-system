import { createListenerMiddleware } from '@reduxjs/toolkit';
import { getUserRole } from '../../parseTokens';
import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation } from '../slices/authorisationSlice';
import { RootState } from '../store';

export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  type: TokenUpdatedType,
  effect: async (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const privilegedRoles = state.config.settings.privilegedRoles;

    const role = getUserRole();
    listenerApi.dispatch(
      setAuthorisation({
        role,
        isPrivilegedUser: privilegedRoles.includes(role),
      })
    );
  },
});
