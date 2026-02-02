import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface AuthorisationState {
  role: string;
  isPrivilegedUser: boolean;
  isAdminMode: boolean;
}

export const initialState: AuthorisationState = {
  role: 'default',
  isPrivilegedUser: false,
  isAdminMode: false,
};

export const authSlice = createSlice({
  name: 'Authorisation',
  initialState: initialState,
  reducers: {
    setAuthorisation(
      state,
      action: PayloadAction<Omit<AuthorisationState, 'isAdminMode'>>
    ) {
      state.role = action.payload.role;
      state.isPrivilegedUser = action.payload.isPrivilegedUser;

      if (!state.isPrivilegedUser) {
        state.isAdminMode = false;
      }
    },
    setIsAdminMode(state, action: PayloadAction<boolean>) {
      state.isAdminMode = state.isPrivilegedUser ? action.payload : false;
    },
  },
});

export const selectAuthorisation = (state: RootState) => state.authorisation;
export const { setAuthorisation, setIsAdminMode } = authSlice.actions;

export default authSlice.reducer;
