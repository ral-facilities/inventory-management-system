import reducer, {
  initialState,
  setAuthorisation,
  setIsAdminMode,
} from './authorisationSlice';

describe('authorisationSlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(state).toEqual(initialState);
  });

  it('should set role and admin flag', () => {
    const action = setAuthorisation({
      role: 'admin',
      isAdminUser: true,
    });

    const state = reducer(initialState, action);

    expect(state.role).toBe('admin');
    expect(state.isAdminUser).toBe(true);
    expect(state.isAdminMode).toBe(false);
  });

  it('should set isAdminMode to false if the isAdminUser is false', () => {
    const action = setAuthorisation({
      role: 'admin',
      isAdminUser: false,
    });

    const state = reducer({ ...initialState, isAdminMode: true }, action);

    expect(state.role).toBe('admin');
    expect(state.isAdminUser).toBe(false);
    expect(state.isAdminMode).toBe(false);
  });

  it('should update isAdminMode', () => {
    const action = setIsAdminMode(true);

    const state = reducer({ ...initialState, isAdminUser: true }, action);

    expect(state.isAdminMode).toBe(true);
  });

  it('should not modify role when toggling isAdminMode', () => {
    const startState = {
      role: 'user',
      isAdminUser: true,
      isAdminMode: false,
    };

    const state = reducer(startState, setIsAdminMode(true));

    expect(state.role).toBe('user');
    expect(state.isAdminUser).toBe(true);
    expect(state.isAdminMode).toBe(true);
  });
});
