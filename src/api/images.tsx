import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import ProgressTimeout from '@uppy/utils/lib/ProgressTimeout';
import {
  AxiosError,
  type AxiosProgressEvent,
  type AxiosRequestConfig,
} from 'axios';
import NetworkError from '../common/UppyNetworkError';
import { storageApi } from './api';
import { APIImage, APIImageWithURL } from './api.types';

export const getImage = async (id: string): Promise<APIImageWithURL> => {
  return storageApi.get(`/images/${id}`).then((response) => {
    return response.data;
  });
};

export const useGetImage = (
  id: string
): UseQueryResult<APIImageWithURL, AxiosError> => {
  return useQuery({
    queryKey: ['Image', id],
    queryFn: () => getImage(id),
  });
};

const getImages = async (
  entityId: string,
  primary?: boolean
): Promise<APIImage[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity_id', entityId);

  if (primary !== undefined) queryParams.append('primary', String(primary));
  return storageApi
    .get(`/images`, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useGetImages = (
  entityId?: string,
  primary?: boolean
): UseQueryResult<APIImage[], AxiosError> => {
  return useQuery({
    queryKey: ['Images', entityId, primary],
    queryFn: () => getImages(entityId ?? '', primary),
    enabled: !!entityId,
  });
};

const deleteImage = async (id: string): Promise<void> => {
  return storageApi
    .delete(`/images/${id}`, {})
    .then((response) => response.data);
};

export const useDeleteImage = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`Images`] });
      queryClient.removeQueries({ queryKey: [`Image`] });
    },
  });
};

export interface ImageAxiosOptions {
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  onTimeout?: (timeout: number) => void;
  timeout?: number;
  body?: FormData | null;
  signal?: AbortSignal;
}

export interface UppyAPIImage {
  body: APIImage;
  status: number;
  uploadURL?: string;
}

const noop = (): void => {};
export const postImage = async (
  url: string,
  options: ImageAxiosOptions = {}
): Promise<UppyAPIImage> => {
  const {
    body = null,
    onUploadProgress = noop,
    onTimeout = noop,
    timeout = 30000, // Default timeout of 30 seconds
    signal,
  } = options;

  const timer = new ProgressTimeout(timeout, onTimeout);

  const config: AxiosRequestConfig = {
    url: url,
    method: 'POST',
    data: body,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      timer.progress();
      onUploadProgress?.(event);
    },
    signal,
  };
  return storageApi
    .request<APIImage>(config)
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

      // Handle network error
      if (error.isAxiosError && !error.response) {
        return Promise.reject(new NetworkError(error));
      }

      return Promise.reject(error); // Rethrow any other error
    });
};

export const usePostImage = (): UseMutationResult<
  UppyAPIImage,
  AxiosError | Error | NetworkError,
  { url: string; options: ImageAxiosOptions }
> => {
  return useMutation({
    mutationFn: ({ url, options }) => postImage(url, options),
    retry: 3,
  });
};
