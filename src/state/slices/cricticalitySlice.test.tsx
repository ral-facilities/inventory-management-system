import reducer, { initialState, setIsCriticalMode } from './criticalitySlice';

describe('criticalitySlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(state).toEqual(initialState);
  });

  it('should update isCriticalMode', () => {
    const action = setIsCriticalMode(true);

    const state = reducer(initialState, action);

    expect(state.isCriticalMode).toBe(true);
  });
});
