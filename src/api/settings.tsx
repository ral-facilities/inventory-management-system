import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { imsApi } from './api';
import { SparesDefinition } from './api.types';

const getSparesDefinition = async (): Promise<SparesDefinition> => {
  return imsApi.get('/v1/settings/spares_definition').then((response) => {
    return response.data;
  });
};

export const useGetSparesDefinition = (): UseQueryResult<
  SparesDefinition,
  AxiosError
> => {
  return useQuery({
    queryKey: ['SparesDefinition'],
    queryFn: () => {
      return getSparesDefinition();
    },
  });
};
