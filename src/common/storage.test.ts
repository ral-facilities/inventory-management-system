import { createBooleanLocalStorage } from './storage';

describe('isAdminModeStorage', () => {
  const isAdminModeStorage = createBooleanLocalStorage('test');
  const localStorageGetItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

  const localStorageSetItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'setItem'
  );

  const localStorageRemoveItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'removeItem'
  );

  const KEY = 'inventory-management-system:test';

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('load', () => {
    it('should return true when stored value is "true"', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'true');

      const result = isAdminModeStorage.load();

      expect(result).toBe(true);
      expect(localStorageGetItemMock).toHaveBeenCalledWith(KEY);
    });

    it('should return false when stored value is "false"', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'false');

      const result = isAdminModeStorage.load();

      expect(result).toBe(false);
    });

    it('should return undefined when value is missing', () => {
      localStorageGetItemMock.mockImplementationOnce(() => null);

      const result = isAdminModeStorage.load();

      expect(result).toBeUndefined();
    });

    it('should return undefined for an invalid value', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'garbage');

      const result = isAdminModeStorage.load();

      expect(result).toBeUndefined();
    });
  });

  describe('save', () => {
    it('should store "true"', () => {
      isAdminModeStorage.save(true);

      expect(localStorageSetItemMock).toHaveBeenCalledWith(KEY, 'true');
    });

    it('should store "false"', () => {
      isAdminModeStorage.save(false);

      expect(localStorageSetItemMock).toHaveBeenCalledWith(KEY, 'false');
    });
  });

  describe('clear', () => {
    it('should remove the key from localStorage', () => {
      isAdminModeStorage.clear();

      expect(localStorageRemoveItemMock).toHaveBeenCalledWith(KEY);
    });
  });
});
