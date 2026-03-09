import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface CriticalityState {
  isCriticalMode: boolean;
}

export const initialState: CriticalityState = {
  isCriticalMode: false,
};

export const criticalitySlice = createSlice({
  name: 'Criticality',
  initialState: initialState,
  reducers: {
    setIsCriticalMode(state, action: PayloadAction<boolean>) {
      state.isCriticalMode = action.payload;
    },
  },
});

export const selectCriticality = (state: RootState) => state.criticality;
export const { setIsCriticalMode } = criticalitySlice.actions;

export default criticalitySlice.reducer;
