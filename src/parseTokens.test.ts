import { getUserRole, readSciGatewayToken } from './parseTokens';
import {
  ADMIN_ROLE_TOKEN,
  DEFAULT_ROLE_TOKEN,
  NO_USERNAME_TOKEN,
} from './testUtils';

describe('parseTokens', () => {
  const localStorageGetItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

  describe('readSciGatewayToken', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should read token from local storage', () => {
      localStorageGetItemMock.mockImplementationOnce(() => ADMIN_ROLE_TOKEN);
      const result = readSciGatewayToken();
      expect(result).toEqual(ADMIN_ROLE_TOKEN);
    });

    it("should return null if token doesn't contain username field", () => {
      localStorageGetItemMock.mockImplementationOnce(() => NO_USERNAME_TOKEN);
      const result = readSciGatewayToken();
      expect(result).toEqual(null);
    });

    it("should return null if token doesn't exist", () => {
      localStorageGetItemMock.mockImplementationOnce(() => null);
      const result = readSciGatewayToken();
      expect(result).toEqual(null);
    });
  });

  describe('getUserRole', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return `default` if user has no role in token', () => {
      localStorageGetItemMock.mockImplementationOnce(() => DEFAULT_ROLE_TOKEN);
      const result = getUserRole();
      expect(result).toEqual('default');
    });

    it('should return admin if user has admin role', () => {
      localStorageGetItemMock.mockImplementationOnce(() => ADMIN_ROLE_TOKEN);
      const result = getUserRole();
      expect(result).toEqual('admin');
    });
  });
});
