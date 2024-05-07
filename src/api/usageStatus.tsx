import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AddUsageStatus, UsageStatus } from '../app.types';
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

const addUsageStatus = async (
  usageStatus: AddUsageStatus
): Promise<UsageStatus> => {
  return imsApi
    .post<UsageStatus>(`/v1/usage-statuses`, usageStatus)
    .then((response) => response.data);
};

export const useAddUsageStatus = (): UseMutationResult<
  UsageStatus,
  AxiosError,
  AddUsageStatus
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (usageStatus: AddUsageStatus) => addUsageStatus(usageStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['UsageStatuses'],
      });
    },
  });
};

const deleteUsageStatus = async (usageStatusId: string): Promise<void> => {
  return imsApi
    .delete(`/v1/usage-statuses/${usageStatusId}`)
    .then((response) => response.data);
};

export const useDeleteUsageStatus = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (usageStatusId: string) => deleteUsageStatus(usageStatusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['UsageStatuses'] });
      queryClient.removeQueries({ queryKey: ['UsageStatus'] });
    },
  });
};
