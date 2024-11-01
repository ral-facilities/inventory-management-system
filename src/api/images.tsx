import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { storageApi } from './api';
import { Image, ImageGet } from './api.types';

export const getImage = async (id: string): Promise<ImageGet> => {
  return storageApi.get(`/images/${id}`).then((response) => {
    return response.data;
  });
};

const getImages = async (entityId: string): Promise<Image[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity_id', entityId);
  return storageApi
    .get(`/images`, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useGetImages = (
  entityId?: string
): UseQueryResult<Image[], AxiosError> => {
  return useQuery({
    queryKey: ['Images', entityId],
    queryFn: () => getImages(entityId ?? ''),
    enabled: !!entityId,
  });
};
