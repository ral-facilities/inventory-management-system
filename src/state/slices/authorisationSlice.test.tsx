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

  it('should set role and privileged flag', () => {
    const action = setAuthorisation({
      role: 'admin',
      isPrivilegedUser: true,
    });

    const state = reducer(initialState, action);

    expect(state.role).toBe('admin');
    expect(state.isPrivilegedUser).toBe(true);
    expect(state.isAdminMode).toBe(false);
  });

  it('should update isAdminMode', () => {
    const action = setIsAdminMode(true);

    const state = reducer(initialState, action);

    expect(state.isAdminMode).toBe(true);
  });

  it('should not modify role when toggling isAdminMode', () => {
    const startState = {
      role: 'user',
      isPrivilegedUser: false,
      isAdminMode: false,
    };

    const state = reducer(startState, setIsAdminMode(true));

    expect(state.role).toBe('user');
    expect(state.isPrivilegedUser).toBe(false);
    expect(state.isAdminMode).toBe(true);
  });
});
