import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { jobSchedulerApi } from './api';
import { Job } from './api.types';

const getJob = async (jobId: string): Promise<Job> => {
  return jobSchedulerApi.get(`/jobs/${jobId}`).then((response) => {
    return response.data;
  });
};

export const useGetJob = (jobId: string): UseQueryResult<Job, AxiosError> => {
  return useQuery({
    queryKey: [`${jobId}Job`],
    queryFn: () => {
      return getJob(jobId);
    },
  });
};

const postJob = async (jobId: string): Promise<void> => {
  const response = await jobSchedulerApi.post<void>(`/jobs/${jobId}/run`);
  return response.data;
};

export const usePostJob = (
  jobId: string
): UseMutationResult<void, AxiosError, void> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${jobId}Job`] });
    },
  });
};
