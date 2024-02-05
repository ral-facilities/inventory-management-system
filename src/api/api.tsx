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

imsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // For first 403 assume token expired and attempt to retry
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Attempt to refresh token via SciGateway
      document.dispatchEvent(
        new CustomEvent(MicroFrontendId, {
          detail: {
            type: InvalidateTokenType,
          },
        })
      );

      // Update the authorisation and retry the request
      originalRequest.headers['Authorization'] =
        `Bearer ${readSciGatewayToken()}`;
      imsApi(originalRequest).then((response) => response.data);
    }

    Promise.reject(error);
  }
);
