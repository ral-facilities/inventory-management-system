import { AxiosError } from 'axios';
import retryIMS_APIErrors from './retryIMS_APIErrors';

describe('retryIMS_APIErrors', () => {
  let error: AxiosError;

  beforeEach(() => {
    error = {
      isAxiosError: true,
      response: {
        data: { detail: 'Test error message (response data)' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        // @ts-expect-error: not needed for test
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };
  });

  it('returns false if error code is 403', () => {
    if (error.response) {
      error.response.status = 403;
    }
    const result = retryIMS_APIErrors(0, error);
    expect(result).toBe(false);
  });

  it('returns false if failureCount is 3 or greater', () => {
    let result = retryIMS_APIErrors(3, error);
    expect(result).toBe(false);

    result = retryIMS_APIErrors(4, error);
    expect(result).toBe(false);
  });

  it('returns true if non-auth error and failureCount is less than 3', () => {
    let result = retryIMS_APIErrors(0, error);
    expect(result).toBe(true);

    result = retryIMS_APIErrors(2, error);
    expect(result).toBe(true);
  });
});
