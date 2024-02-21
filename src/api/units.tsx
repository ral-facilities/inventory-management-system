import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Unit } from '../app.types';
import { imsApi } from './api';

const fetchUnits = async (): Promise<Unit[]> => {
  return imsApi.get('/v1/units').then((response) => {
    return response.data;
  });
};

export const useUnits = (): UseQueryResult<Unit[], AxiosError> => {
  return useQuery({
    queryKey: ['Units'],
    queryFn: (params) => {
      return fetchUnits();
    },
  });
};
