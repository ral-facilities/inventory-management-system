import { AxiosError } from 'axios';

class NetworkError extends Error {
  public cause: unknown;
  public isNetworkError: true;
  public request: null | AxiosError['request'];

  constructor(error: unknown, request: null | AxiosError['request'] = null) {
    super(
      `This looks like a network error, the endpoint might be blocked by an internet provider or a firewall.`
    );

    this.cause = error;
    this.isNetworkError = true;
    this.request = request;
  }
}

export default NetworkError;
