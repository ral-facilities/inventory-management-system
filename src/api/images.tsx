import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { storageApi } from './api';
import { APIImage, ImageGet } from './api.types';

export const getImage = async (id: string): Promise<ImageGet> => {
  return storageApi.get(`/images/${id}`).then((response) => {
    return response.data;
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
