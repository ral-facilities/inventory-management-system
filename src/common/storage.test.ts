import { clearIsAdminMode, loadIsAdminMode, saveIsAdminMode } from './storage';

describe('adminModeStorage', () => {
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

  const KEY = 'inventory-management-system:isAdminMode';

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('loadIsAdminMode', () => {
    it('should return true when stored value is "true"', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'true');

      const result = loadIsAdminMode();

      expect(result).toBe(true);
      expect(localStorageGetItemMock).toHaveBeenCalledWith(KEY);
    });

    it('should return false when stored value is "false"', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'false');

      const result = loadIsAdminMode();

      expect(result).toBe(false);
    });

    it('should return undefined when value is missing', () => {
      localStorageGetItemMock.mockImplementationOnce(() => null);

      const result = loadIsAdminMode();

      expect(result).toBeUndefined();
    });

    it('should return undefined for an invalid value', () => {
      localStorageGetItemMock.mockImplementationOnce(() => 'garbage');

      const result = loadIsAdminMode();

      expect(result).toBeUndefined();
    });
  });

  describe('saveIsAdminMode', () => {
    it('should store "true"', () => {
      saveIsAdminMode(true);

      expect(localStorageSetItemMock).toHaveBeenCalledWith(KEY, 'true');
    });

    it('should store "false"', () => {
      saveIsAdminMode(false);

      expect(localStorageSetItemMock).toHaveBeenCalledWith(KEY, 'false');
    });
  });

  describe('clearIsAdminMode', () => {
    it('should remove the key from localStorage', () => {
      clearIsAdminMode();

      expect(localStorageRemoveItemMock).toHaveBeenCalledWith(KEY);
    });
  });
});
