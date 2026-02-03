import { TokenUpdatedType } from '../actions/actions.types';
import { setAuthorisation, setIsAdminMode } from '../slices/authorisationSlice';
import { configureAppStore, StorageRegistry } from '../store';

describe('authListenerMiddleware', () => {
  let store: ReturnType<typeof configureAppStore>;
  let mockGetUserRole: () => string;
  let storageRegistryDict: StorageRegistry;

  beforeEach(() => {
    mockGetUserRole = vi.fn().mockReturnValue('admin');
    const storageDeps = {
      save: vi.fn(),
      clear: vi.fn(),
      load: vi.fn(),
    };
    storageRegistryDict = {
      authorisation: storageDeps,
      criticality: storageDeps,
    };

    store = configureAppStore(undefined, mockGetUserRole, storageRegistryDict);
  });

  it('sets authorisation when token is updated', async () => {
    store.dispatch({ type: TokenUpdatedType });
    await Promise.resolve();
    expect(mockGetUserRole).toHaveBeenCalled();

    const state = store.getState();
    expect(state.authorisation.role).toBe('admin');
    expect(state.authorisation.isPrivilegedUser).toBe(true);
  });

  it('should save admin mode when user IS privileged', async () => {
    store.dispatch(setAuthorisation({ role: 'admin', isPrivilegedUser: true }));

    store.dispatch(setIsAdminMode(true));

    await Promise.resolve();

    expect(storageRegistryDict.authorisation.save).toHaveBeenCalledWith(true);
    expect(storageRegistryDict.authorisation.clear).not.toHaveBeenCalled();
  });

  it('should clear admin mode when user is NOT privileged', async () => {
    store.dispatch(
      setAuthorisation({ role: 'default', isPrivilegedUser: false })
    );

    store.dispatch(setIsAdminMode(true));

    await Promise.resolve();

    expect(storageRegistryDict.authorisation.clear).toHaveBeenCalled();
    expect(storageRegistryDict.authorisation.save).not.toHaveBeenCalled();
  });
});
