import axios from 'axios';
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
let failedAuthRequestQueue: ((reject?: boolean) => any)[] = [];

/* This should be called when SciGateway successfully refreshes the access token - it retries
   all requests that failed due to an invalid token */
export const retryFailedAuthRequests = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.filter((callback) => callback());
};

/* This should be called when SciGateway logs out as would occurr if a token refresh fails
   due to the refresh token being out of date - it rejects all active request promises that
   were awaiting a token refresh */
export const clearFailedAuthRequestsQueue = (reject?: boolean) => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.filter((callback) => callback(true));
};

imsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Here assume 403 => the token is invalid and needs refreshing
    if (error.response.status === 403) {
      // Prevent other requests from also attempting to refresh while waiting for
      // SciGateway to refresh the token
      if (!isFetchingAccessToken) {
        isFetchingAccessToken = true;

        // Request SciGateway to refresh the token
        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, {
            detail: {
              type: InvalidateTokenType,
            },
          })
        );
      }

      // Add request to queue to be resolved only once SciGateway has successfully
      // refreshed the token
      return new Promise((resolve) => {
        failedAuthRequestQueue.push((reject?: boolean) => {
          if (reject) resolve(Promise.reject());
          else resolve(imsApi(originalRequest));
        });
      });
    } else {
      // Any other error
      Promise.reject(error);
    }
  }
);
