import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface AuthorisationState {
  role: string;
  isAdminUser: boolean;
  isAdminMode: boolean;
}

export const initialState: AuthorisationState = {
  role: 'default',
  isAdminUser: false,
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
      state.isAdminUser = action.payload.isAdminUser;

      if (!state.isAdminUser) {
        state.isAdminMode = initialState.isAdminMode;
      } else {
        state.isAdminMode = state.isAdminMode ?? initialState.isAdminMode;
      }
    },
    setIsAdminMode(state, action: PayloadAction<boolean>) {
      state.isAdminMode = state.isAdminUser
        ? action.payload
        : initialState.isAdminMode;
    },
  },
});

export const selectAuthorisation = (state: RootState) => state.authorisation;
export const { setAuthorisation, setIsAdminMode } = authSlice.actions;

export default authSlice.reducer;
