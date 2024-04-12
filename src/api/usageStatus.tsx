import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { UsageStatus } from '../app.types';
import { imsApi } from './api';

const fetchUsageStatuses = async (): Promise<UsageStatus[]> => {
  return imsApi.get('/v1/usage-statuses').then((response) => {
    return response.data;
  });
};

export const useUsageStatuses = (): UseQueryResult<
  UsageStatus[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['UsageStatuses'],
    queryFn: () => {
      return fetchUsageStatuses();
    },
  });
};
