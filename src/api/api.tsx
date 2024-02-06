import axios, { AxiosError } from 'axios';
import { MicroFrontendId } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';
import { InvalidateTokenType } from '../state/actions/actions.types';

export const imsApi = axios.create();

imsApi.interceptors.request.use(async (config) => {
  const apiUrl = (await settings)?.apiUrl || '';
  config.baseURL = apiUrl;
  config.headers['Authorization'] = `Bearer ${readSciGatewayToken()}`;
  return config;
});

// These are for ensuring refresh request is only sent once when multiple requests
// are failing due to 403's at the same time
let isFetchingAccessToken = false;
let accessTokenSubscribers: ((error?: AxiosError) => any)[] = [];

imsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // For first 403 assume token expired and attempt to retry, but also currently have
    // not method of awaiting refresh so for now just retry a few more times
    if (
      error.response.status === 403 &&
      (originalRequest._retries === undefined || originalRequest._retries < 3)
    ) {
      originalRequest._retries =
        originalRequest._retries === undefined
          ? 0
          : (originalRequest._retries += 1);

      // Prevent other requests from also attempting to refresh while waiting for the
      // refresh token response
      if (!isFetchingAccessToken) {
        isFetchingAccessToken = true;

        // Use this to only retry the original request that triggered the refresh
        originalRequest._hasRequestedRefresh = true;

        // Attempt to refresh token via SciGateway
        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, {
            detail: {
              type: InvalidateTokenType,
            },
          })
        );

        // Retry the request (with the new token)
        return imsApi(originalRequest).then((response) => {
          isFetchingAccessToken = false;
          // Retry all the requests that may have occurred prior to this
          accessTokenSubscribers.filter((callback) => callback());
        });
      } else if (originalRequest._hasRequestedRefresh) {
        // Retry the original request (with the new token)
        return imsApi(originalRequest);
      } else {
        // Already have requested a refresh, so add request to a list to be resolved later once the
        // new token is obtained
        return new Promise((resolve) => {
          accessTokenSubscribers.push((error?: AxiosError) => {
            if (error !== undefined) resolve(Promise.reject(error));
            else resolve(imsApi(originalRequest));
          });
        });
      }
    } else {
      // Still unable to refresh
      accessTokenSubscribers.filter((callback) => callback(error));
      Promise.reject(error);
    }
  }
);
