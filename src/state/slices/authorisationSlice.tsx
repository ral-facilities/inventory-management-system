import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface AuthorisationState {
  role: string;
  isPrivilegedUser: boolean;
  adminMode: boolean;
}

export const initialState: AuthorisationState = {
  role: 'default',
  isPrivilegedUser: false,
  adminMode: false,
};

export const authSlice = createSlice({
  name: 'Authorisation',
  initialState: initialState,
  reducers: {
    setAuthorisation(
      state,
      action: PayloadAction<Omit<AuthorisationState, 'adminMode'>>
    ) {
      state.role = action.payload.role;
      state.isPrivilegedUser = action.payload.isPrivilegedUser;
    },
    setAdminMode(state, action: PayloadAction<boolean>) {
      if (!state.isPrivilegedUser) state.adminMode = false;
      else state.adminMode = action.payload;
    },
  },
});

export const selectAuthorisation = (state: RootState) => state.authorisation;
export const { setAuthorisation, setAdminMode } = authSlice.actions;

export default authSlice.reducer;
