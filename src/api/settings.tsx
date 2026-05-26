import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { imsApi } from './api';
import { InUseDefinition, SparesDefinition } from './api.types';

// This request can return a 204 status, in which case it returns an empty string.
const getSparesDefinition = async (): Promise<SparesDefinition | ''> => {
  return imsApi.get('/v1/settings/spares-definition').then((response) => {
    return response.data;
  });
};

export const useGetSparesDefinition = (): UseQueryResult<
  SparesDefinition | '',
  AxiosError
> => {
  return useQuery({
    queryKey: ['SparesDefinition'],
    queryFn: () => {
      return getSparesDefinition();
    },
  });
};

// This request can return a 204 status, in which case it returns an empty string.
const getInUseDefinition = async (): Promise<InUseDefinition | ''> => {
  return imsApi.get('/v1/settings/in-use-definition').then((response) => {
    return response.data;
  });
};

export const useGetInUseDefinition = (): UseQueryResult<
  InUseDefinition | '',
  AxiosError
> => {
  return useQuery({
    queryKey: ['InUseDefinition'],
    queryFn: () => {
      return getInUseDefinition();
    },
  });
};
