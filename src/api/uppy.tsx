import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { Body } from '@uppy/core';
import ProgressTimeout from '@uppy/utils/lib/ProgressTimeout';
import type { AxiosProgressEvent } from 'axios';
import { AxiosError, type AxiosRequestConfig } from 'axios';
import NetworkError from '../common/UppyNetworkError';
import retryIMS_APIErrors from '../retryIMS_APIErrors';
import { storageApi } from './api';

export interface UppyAxiosOptions {
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  onTimeout?: (timeout: number) => void;
  timeout?: number;
  body?: FormData | null;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface UppyBody<B extends Body> {
  body: B;
  status: number;
  uploadURL?: string;
}

const noop = (): void => {};
export const postUppy = async <B extends Body>(
  url: string,
  options: UppyAxiosOptions = {}
): Promise<UppyBody<B>> => {
  const {
    body = null,
    onUploadProgress = noop,
    onTimeout = noop,
    timeout = 30000, // Default timeout of 30 seconds
    signal,
    headers = {},
  } = options;

  const timer = new ProgressTimeout(timeout, onTimeout);

  const config: AxiosRequestConfig = {
    url: url,
    method: 'POST',
    data: body,
    headers: headers,
    onUploadProgress: (event: AxiosProgressEvent) => {
      timer.progress();
      onUploadProgress?.(event);
    },
    signal,
  };
  return storageApi
    .request<B>(config)
    .then((response) => {
      timer.done(); // Clear the timer
      return {
        status: response.status,
        body: response.data,
        uploadURL: response.config.baseURL,
      }; // Return the API response data
    })
    .catch((error: AxiosError) => {
      timer.done(); // Clear the timer

      // Handle abort error
      if (signal?.aborted) {
        return Promise.reject(
          new DOMException('Request aborted', 'AbortError')
        );
      }

      // Handle timeout specifically

      if (error.code === 'ECONNABORTED') {
        const timeoutSeconds = Math.ceil(timeout / 1000);
        return Promise.reject(
          new Error(`Request timed out after ${timeoutSeconds} seconds.`)
        );
      }

      return Promise.reject(new NetworkError(error)); // Rethrow any other error
    });
};

export const usePostUppy = <B extends Body>(): UseMutationResult<
  UppyBody<B>,
  AxiosError | Error | NetworkError,
  { url: string; options: UppyAxiosOptions }
> => {
  return useMutation({
    mutationFn: ({ url, options }) => postUppy(url, options),
    retry: (failureCount, error) => {
      return retryIMS_APIErrors(failureCount, error as AxiosError);
    },
  });
};
