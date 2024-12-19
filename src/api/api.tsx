import axios from 'axios';
import { MicroFrontendId } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { InventoryManagementSystemSettings, settings } from '../settings';
import { InvalidateTokenType } from '../state/actions/actions.types';
import { tokenRefreshed } from '../state/scigateway.actions';
import { APIError } from './api.types';

// These are for ensuring refresh request is only sent once when multiple requests
// are failing due to 403's at the same time
let isFetchingAccessToken = false;
let failedAuthRequestQueue: ((shouldReject?: boolean) => void)[] = [];

/* This should be called when SciGateway successfully refreshes the access token - it retries
   all requests that failed due to an invalid token */
export const retryFailedAuthRequests = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.forEach((callback) => callback());
  failedAuthRequestQueue = [];
};

/* This should be called when SciGateway logs out as would occur if a token refresh fails
   due to the refresh token being out of date - it rejects all active request promises that
   were awaiting a token refresh using the original error that occurred on the first attempt */
export const clearFailedAuthRequestsQueue = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.forEach((callback) => callback(true));
  failedAuthRequestQueue = [];
};

const createAuthenticatedClient = (props: {
  getURL: (settings: InventoryManagementSystemSettings) => string;
}) => {
  const apiClient = axios.create();

  apiClient.interceptors.request.use(async (config) => {
    const settingsData = await settings;
    config.baseURL = settingsData ? props.getURL(settingsData) : '';
    config.headers['Authorization'] = `Bearer ${readSciGatewayToken()}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const originalRequest = error.config;
      const errorMessage: string = error.response?.data
        ? ((error.response.data as APIError).detail.toLocaleLowerCase() ??
          error.message)
        : error.message;

      // Check if the token is invalid and needs refreshing
      // only allow a request to be retried once. Don't retry if not logged
      // in, it should not have been accessible
      if (
        error.response?.status === 403 &&
        errorMessage.includes('expired token') &&
        !originalRequest._retried &&
        localStorage.getItem('scigateway:token')
      ) {
        originalRequest._retried = true;

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
        return new Promise((resolve, reject) => {
          failedAuthRequestQueue.push((shouldReject?: boolean) => {
            if (shouldReject) reject(error);
            else resolve(apiClient(originalRequest));
          });
        });
      }
      // Any other error
      else return Promise.reject(error);
    }
  );

  return apiClient;
};

export function uppyOnAfterResponse(xhr: XMLHttpRequest) {
  if (xhr.status >= 400 && xhr.status < 600) {
    const errorMessage: string = (
      JSON.parse(xhr.responseText) as APIError
    ).detail.toLocaleLowerCase();

    // Check if the token is invalid and needs refreshing
    if (
      xhr.status === 403 &&
      errorMessage.includes('expired token') &&
      localStorage.getItem('scigateway:token')
    ) {
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

        // Create a new promise to wait for the token to be refreshed
        const tokenRefreshedPromise = new Promise<void>((resolve, reject) => {
          const handler = (e: Event) => {
            const action = (e as CustomEvent).detail;
            if (tokenRefreshed.match(action)) {
              document.removeEventListener(MicroFrontendId, handler);
              isFetchingAccessToken = false;
              resolve(); // Resolve the promise when the token is refreshed
            }
          };

          const timeoutId = setTimeout(() => {
            // If the token isn't refreshed within a reasonable timeframe, reject the promise
            document.removeEventListener(MicroFrontendId, handler);
            isFetchingAccessToken = false;
            reject();
          }, 20 * 1000); // 20 seconds timeout

          document.addEventListener(MicroFrontendId, handler);

          // Cleanup timeout when resolved
          handler.resolve = () => clearTimeout(timeoutId);
        });

        return tokenRefreshedPromise;
      }
    }
  }
}

export function uppyOnBeforeRequest(xhr: XMLHttpRequest) {
  xhr.setRequestHeader('Authorization', `Bearer ${readSciGatewayToken()}`);
}

export const imsApi = createAuthenticatedClient({
  getURL: (settings) => settings.imsApiUrl,
});

export const storageApi = createAuthenticatedClient({
  getURL: (settings) => settings.osApiUrl,
});
