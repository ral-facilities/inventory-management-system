import { getUserRole, readSciGatewayToken } from './parseTokens';

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
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
      );
      const result = readSciGatewayToken();
      expect(result).toEqual(
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
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

  describe('getUserRole', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return `default` if user has no role in token', () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOltdLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.JTdyZHZTU2Vd1cZPzsBGBB_hs72KS4LODyhAyKdNTPWMnp_lEs2fmVSqJjSx3mOTW4J40c7LnJcw6ALlCGuEG3DShQKdoYTtH8JLNyzXi9yNYtPlBTEfWqFKK_IYY9sA_WzlQwYDGLD7jsvCvm92CdWjoNtcfDZ0eIfRjHuIRsW5XllerFFE7ouv9awulGCEHv-zl2m0SpMF-mHUYJV9JbB5bgrqs635vYL-IJg_qdr10Cn11BUhO1ulrFrk1QLhty-_L8LC2d2j11xqEuIMlEcVkQ6w79U1uzg-NEYcHzcuuaitQjZzKsDD8eMDT-dBkIPZxDWzlUuySkGUKDJPzw'
      );
      const result = getUserRole();
      expect(result).toEqual('default');
    });

    it('should return admin if user has admin role', () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w'
      );
      const result = getUserRole();
      expect(result).toEqual('admin');
    });
  });
});
