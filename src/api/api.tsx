import axios from 'axios';
import { ErrorParsing, MicroFrontendId } from '../app.types';
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
   were awaiting a token refresh using the orriginal error that occurred on the first attempt */
export const clearFailedAuthRequestsQueue = () => {
  isFetchingAccessToken = false;
  failedAuthRequestQueue.forEach((callback) => callback(true));
  failedAuthRequestQueue = [];
};

imsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const errorMessage: string = error.response?.data
      ? (error.response.data as ErrorParsing).detail.toLocaleLowerCase() ??
        error.message
      : error.message;

    // Check if the token is invalid and needs refreshing
    // only allow a request to be retried once
    if (
      error.response?.status === 403 &&
      errorMessage.includes('expired token') &&
      !originalRequest._retried
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
          else resolve(imsApi(originalRequest));
        });
      });
    }
    // Any other error
    else return Promise.reject(error);
  }
);
