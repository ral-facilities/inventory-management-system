import { isUserAuthorised, readSciGatewayToken } from './parseTokens';

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
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
      );
      const result = readSciGatewayToken();
      expect(result).toEqual(
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
      );
    });

    it("should return null if token doesn't contain username field", () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdXRob3Jpc2VkX3JvdXRlcyI6bnVsbCwiZXhwIjoxNjQwOTk1MjAwfQ.Qar3mbQ_a4Ih6InEgT-Yk-86-77uoRltjv5m0M7Yp-4OhatXJ93nHJ-CNDGVCcXV2gfsiNfuXc7GOJs3vQ31XqWELU04L27E9T4ZrihIS7WUNlIGo18vFbL3IOnOqkDgvnPvHqFxa-Bk3Acppgn8yq9_fqoDWNLaGNhKKZovwobkxoNJF6wgj12OjJz4_-hHlHeMfEamosIivh0SHkGs_gAJdXBltfX4uqUStXKZmkW8TfPTU07iMzp9csCUbp3IDLMEcEN9H7V1QSnTFSjoeenXnXitrUY1ygmy1nreKGGfhhFkCBFWe6h65bEsbtVMWIJjq0JnefCQ8rsamJHXsw'
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
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOlsiYWRtaW4iXSwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.gWXkZNeLCgNA04KhkGcAUB8WwrrVr8HMKp8yd9BUEBfDuiN1yekPxwKJ7LZDndHqYL4z9WWfVsDE5vYyWfjDJjhoymuP-VYTAI2GxbmazRmknsl9L-vRo31oPX3v2Cs5V2tcBv7dM49gzY7w-dS0b9QsOrn4Y1z9zLj4kLpVtNm0EhtbwThxMk8qVNNtEu76TAnYrdWAoz7_IedBh9NRf48EKJFfoh4CSbfXhHsGRZjvAKnjU-khaibWP3aWuMzN1nwQJ8WasgvhPaxMxd1qzKTbfpMMjg2eo3hDcQogU545P8zO4PcfzIid1g9hF1vMgRsAtQNK385oqBjYfOOWZw'
      );
      const result = await isUserAuthorised();
      expect(result).toEqual(true);
    });

    it('should return false if token does not contain any roles', async () => {
      localStorageGetItemMock.mockImplementationOnce(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOltdLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.JTdyZHZTU2Vd1cZPzsBGBB_hs72KS4LODyhAyKdNTPWMnp_lEs2fmVSqJjSx3mOTW4J40c7LnJcw6ALlCGuEG3DShQKdoYTtH8JLNyzXi9yNYtPlBTEfWqFKK_IYY9sA_WzlQwYDGLD7jsvCvm92CdWjoNtcfDZ0eIfRjHuIRsW5XllerFFE7ouv9awulGCEHv-zl2m0SpMF-mHUYJV9JbB5bgrqs635vYL-IJg_qdr10Cn11BUhO1ulrFrk1QLhty-_L8LC2d2j11xqEuIMlEcVkQ6w79U1uzg-NEYcHzcuuaitQjZzKsDD8eMDT-dBkIPZxDWzlUuySkGUKDJPzw'
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
});
