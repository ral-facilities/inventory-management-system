import { AxiosError } from 'axios';
import retryIMS_APIErrors from './retryIMS_APIErrors';

// have to unmock here as we mock "globally" in setupTests.tsx
jest.unmock('./retryIMS_APIErrors');

describe('retryIMS_APIErrors', () => {
  let error: AxiosError;

  beforeEach(() => {
    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: { detail: 'Test error message (response data)' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };
  });

  it('returns false if error code is 403', () => {
    error.response.status = 403;
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
