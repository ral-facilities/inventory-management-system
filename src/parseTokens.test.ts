import {
  getUserRole,
  isUserAuthorised,
  readSciGatewayToken,
} from './parseTokens';

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
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
      const result = readSciGatewayToken();
      expect(result).toEqual(
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
    });

    it("should return null if token doesn't contain username field", () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySXNBZG1pbiI6dHJ1ZSwiZXhwIjoyNTM0MDIzMDA3OTl9.ZDsEQSW12bFUnfiITz6-WVvibt0xwX2GIBDy-WVvpp8R_eTny4H7Xe1OyMLn3lKSM1sDhnkfItf054W2jJM8nVo0smkJPxs7xnlktTKr3ecZSPjn27afnyme_2OdGafXimEiJ6VuIWZJPEdsguYBKzPVp9aDqPO3AgXxT_MCfzn5-LkbFaeE49mZyYdWfCuxykERamdLjsaH_yRdRor-SKhowNFsLCJFWrz8FC7-mlxB3DYJgHbxf2jteJJL7kgx1zRqTDYU2OBeJzL9O8cfzWDLYgNR4quy4zjOV6aSzOBmp8EbH0H9vKn0ibgLmupnCMcdpVS6mf9WNgIny4iFJA'
      );
      const result = readSciGatewayToken();
      expect(result).toEqual(null);
    });

    it("should return null if token doesn't exist", () => {
      localStorageGetItemMock.mockImplementationOnce(() => null);
      const result = readSciGatewayToken();
      expect(result).toEqual(null);
    });
  });

  describe('isUserAuthorised', () => {
    // only mocked setting the function cares about
    vi.mock('./settings', () => ({
      settings: Promise.resolve({
        privilegedRoles: ['admin'],
      }),
    }));

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return true if token contains privileged role', async () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
      const result = await isUserAuthorised();
      expect(result).toEqual(true);
    });

    it('should return false if token does not contain a privileged role', async () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImRlZmF1bHQiLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.KRtAMZnaB-CQTDV4PGLgQ3yI-9dzMIy0g3SBaThszSjH-ZaoRTuGuJPXlskhuVMpJ8WEbsim3pNU9gSUD3VuEbFekKSubxeZSqLUQSGmJjLppsPayGgX_SVXyZZYJnnLyTCR2nlC-MGX33PUfjIGWkn3f9kjPUNxN0A6aoVBAhTyxTEw-jBTNRYzrzLTzI_nZ0bN1bx3XcTO6Y19__IwGLFUlBn4wDPj-tL-pJro0qedcCWVRhLoHsyVVGTJJk7AZGda2BKJap2y4Jc7SwcOZ5Uyg0fgbl_SvC9BcLIKEE-c41UiG-cjm0_1Jjb6mZU0FOmHXSuNpSo05E8_Vc6Bzw'
      );
      const result = await isUserAuthorised();
      expect(result).toEqual(false);
    });

    it("should return false if token doesn't exist", async () => {
      localStorageGetItemMock.mockImplementationOnce(() => null);
      const result = await isUserAuthorised();
      expect(result).toEqual(false);
    });
  });

  describe('getUserRole', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return undefined if no user role in token', () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOltdLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.JTdyZHZTU2Vd1cZPzsBGBB_hs72KS4LODyhAyKdNTPWMnp_lEs2fmVSqJjSx3mOTW4J40c7LnJcw6ALlCGuEG3DShQKdoYTtH8JLNyzXi9yNYtPlBTEfWqFKK_IYY9sA_WzlQwYDGLD7jsvCvm92CdWjoNtcfDZ0eIfRjHuIRsW5XllerFFE7ouv9awulGCEHv-zl2m0SpMF-mHUYJV9JbB5bgrqs635vYL-IJg_qdr10Cn11BUhO1ulrFrk1QLhty-_L8LC2d2j11xqEuIMlEcVkQ6w79U1uzg-NEYcHzcuuaitQjZzKsDD8eMDT-dBkIPZxDWzlUuySkGUKDJPzw'
      );
      const result = getUserRole();
      expect(result).toEqual(undefined);
    });

    it('should return admin if user has admin role', () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
      );
      const result = getUserRole();
      expect(result).toEqual('admin');
    });
  });
});
