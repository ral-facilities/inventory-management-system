import { setIsCriticalMode } from '../slices/criticalitySlice';
import { configureAppStore, StorageRegistry } from '../store';

describe('authListenerMiddleware', () => {
  let store: ReturnType<typeof configureAppStore>;
  let storageRegistryDict: StorageRegistry;

  beforeEach(() => {
    const storageDeps = {
      save: vi.fn(),
      clear: vi.fn(),
      load: vi.fn(),
    };
    storageRegistryDict = {
      authorisation: storageDeps,
      criticality: storageDeps,
    };

    store = configureAppStore(undefined, undefined, storageRegistryDict);
  });

  it('should store critical mode', async () => {
    store.dispatch(setIsCriticalMode(true));

    await Promise.resolve();

    expect(storageRegistryDict.criticality.save).toHaveBeenCalledWith(true);
  });
});
