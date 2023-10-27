import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { BreadcrumbsInfo, System, SystemPost } from '../app.types';
import { settings } from '../settings';

const fetchSystems = async (parent_id?: string): Promise<System[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  if (parent_id) queryParams.append('parent_id', parent_id);

  return axios
    .get(`${apiUrl}/v1/systems`, { params: queryParams })
    .then((response) => {
      return response.data;
    });
};

export const useSystems = (
  parent_id?: string
): UseQueryResult<System[], AxiosError> => {
  return useQuery<System[], AxiosError>(
    ['Systems', parent_id],
    () => {
      return fetchSystems(parent_id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchSystemsBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/systems/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useSystemsBreadcrumbs = (
  id: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery<BreadcrumbsInfo, AxiosError>(
    ['SystemBreadcrumbs', id],
    () => {
      return fetchSystemsBreadcrumbs(id ?? '');
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== null,
    }
  );
};

const addSystem = async (system: SystemPost): Promise<System> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<System>(`${apiUrl}/v1/systems`, system)
    .then((response) => response.data);
};

export const useAddSystem = (): UseMutationResult<
  System,
  AxiosError,
  SystemPost
> => {
  const queryClient = useQueryClient();
  return useMutation((system: SystemPost) => addSystem(system), {
    onError: (error) => {
      console.log(`Got error: '${error.message}'`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Systems'] });
    },
  });
};
