import {
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { AxiosError } from 'axios';
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
    enabled: !!id,
  });
};

export const useGetImagesIds = (
  ids: string[]
): UseQueryResult<APIImageWithURL>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['Image', id],
      queryFn: () => getImage(id),
      enabled: !!id,
    })),
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
