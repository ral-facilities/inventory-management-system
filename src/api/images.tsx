import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { storageApi } from './api';
import { APIImage, APIImageWithURL, ObjectFilePatch } from './api.types';

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

const patchImage = async (
  id: string,
  fileMetadata: ObjectFilePatch
): Promise<APIImage> => {
  return storageApi
    .patch<APIImage>(`/images/${id}`, fileMetadata)
    .then((response) => response.data);
};

export const usePatchImage = (): UseMutationResult<
  APIImage,
  AxiosError,
  { id: string; fileMetadata: ObjectFilePatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileMetadata }) => patchImage(id, fileMetadata),
    onSuccess: (updatedImage: APIImage) => {
      queryClient.invalidateQueries({ queryKey: ['Images'] });
      queryClient.invalidateQueries({
        queryKey: ['Image', updatedImage.id],
      });
    },
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
