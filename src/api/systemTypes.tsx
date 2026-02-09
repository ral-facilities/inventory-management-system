import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { imsApi } from './api';
import { SystemType } from './api.types';

const getSystemTypes = async (): Promise<SystemType[]> => {
  return imsApi.get(`/v1/system-types`).then((response) => {
    return response.data;
  });
};

export const useGetSystemTypes = (): UseQueryResult<
  SystemType[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['SystemTypes'],
    queryFn: () => getSystemTypes(),
  });
};

const getSystemType = async (id: string): Promise<SystemType> => {
  return imsApi.get(`/v1/system-types/${id}`).then((response) => {
    return response.data;
  });
};

export const getSystemTypeQuery = (id?: string | null, loader?: boolean) =>
  queryOptions<SystemType, AxiosError>({
    queryKey: ['SystemType', id],
    queryFn: () => {
      return getSystemType(id ?? '');
    },
    enabled: !!id,
    retry: loader ? false : undefined,
  });

export const useGetSystemType = (
  id?: string | null
): UseQueryResult<SystemType, AxiosError> => {
  return useQuery(getSystemTypeQuery(id));
};
