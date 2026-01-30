import { TokenUpdatedType } from '../actions/actions.types';
import { configureAppStore } from '../store';

describe('authListenerMiddleware', () => {
  let store: ReturnType<typeof configureAppStore>;
  let mockGetUserRole: () => string;

  beforeEach(() => {
    mockGetUserRole = vi.fn().mockReturnValue('admin');
    store = configureAppStore(undefined, mockGetUserRole);
  });

  it('sets authorisation when token is updated', async () => {
    store.dispatch({ type: TokenUpdatedType });
    await Promise.resolve();
    expect(mockGetUserRole).toHaveBeenCalled();

    const state = store.getState();
    expect(state.authorisation.role).toBe('admin');
    expect(state.authorisation.isPrivilegedUser).toBe(true);
  });
});
