import reducer, {
  initialState,
  setAdminMode,
  setAuthorisation,
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
    expect(state.adminMode).toBe(false);
  });

  it('should update adminMode', () => {
    const action = setAdminMode(true);

    const state = reducer({ ...initialState, isPrivilegedUser: true }, action);

    expect(state.adminMode).toBe(true);
  });

  it('should not modify role when toggling adminMode', () => {
    const startState = {
      role: 'user',
      isPrivilegedUser: true,
      adminMode: false,
    };

    const state = reducer(startState, setAdminMode(true));

    expect(state.role).toBe('user');
    expect(state.isPrivilegedUser).toBe(true);
    expect(state.adminMode).toBe(true);
  });
});
