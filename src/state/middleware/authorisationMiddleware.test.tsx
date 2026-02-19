import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation, setIsAdminMode } from '../slices/authorisationSlice';
import { configureAppStore, StorageDeps } from '../store';

describe('authListenerMiddleware', () => {
  let store: ReturnType<typeof configureAppStore>;
  let mockGetUserRole: () => string;
  let mockStorage: StorageDeps;

  beforeEach(() => {
    mockGetUserRole = vi.fn().mockReturnValue('admin');

    mockStorage = {
      saveIsAdminMode: vi.fn(),
      clearIsAdminMode: vi.fn(),
      loadIsAdminMode: vi.fn(),
    };

    store = configureAppStore(undefined, mockGetUserRole, mockStorage);
  });

  it('sets authorisation when token is updated', async () => {
    store.dispatch({ type: TokenUpdatedType });
    await Promise.resolve();
    expect(mockGetUserRole).toHaveBeenCalled();

    const state = store.getState();
    expect(state.authorisation.role).toBe('admin');
    expect(state.authorisation.isAdminUser).toBe(true);
  });

  it('should save admin mode when user is admin', async () => {
    store.dispatch(setAuthorisation({ role: 'admin', isAdminUser: true }));

    store.dispatch(setIsAdminMode(true));

    await Promise.resolve();

    expect(mockStorage.saveIsAdminMode).toHaveBeenCalledWith(true);
    expect(mockStorage.clearIsAdminMode).not.toHaveBeenCalled();
  });

  it('should clear admin mode when user is not admin', async () => {
    store.dispatch(setAuthorisation({ role: 'default', isAdminUser: false }));

    store.dispatch(setIsAdminMode(true));

    await Promise.resolve();

    expect(mockStorage.clearIsAdminMode).toHaveBeenCalled();
    expect(mockStorage.saveIsAdminMode).not.toHaveBeenCalled();
  });
});
