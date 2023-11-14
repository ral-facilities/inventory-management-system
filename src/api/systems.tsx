import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
  AddSystem,
  BreadcrumbsInfo,
  EditSystem,
  System,
  SystemImportanceType,
} from '../app.types';
import { settings } from '../settings';

/** Utility for turning an importance into an MUI palette colour to display */
export const getSystemImportanceColour = (
  importance: SystemImportanceType
): 'success' | 'warning' | 'error' => {
  switch (importance) {
    case SystemImportanceType.LOW:
      return 'success';
    case SystemImportanceType.MEDIUM:
      return 'warning';
    case SystemImportanceType.HIGH:
      return 'error';
  }
};

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

const fetchSystem = async (id: string): Promise<System> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios.get(`${apiUrl}/v1/systems/${id}`).then((response) => {
    return response.data;
  });
};

// Allows a value of null to disable
export const useSystem = (
  id: string | null
): UseQueryResult<System, AxiosError> => {
  return useQuery<System, AxiosError>(
    ['System', id],
    () => {
      return fetchSystem(id ?? '');
    },
    {
      enabled: id !== null,
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

const addSystem = async (system: AddSystem): Promise<System> => {
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
  AddSystem
> => {
  const queryClient = useQueryClient();
  return useMutation((system: AddSystem) => addSystem(system), {
    onError: (error) => {
      console.log(`Got error: '${error.message}'`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Systems'] });
    },
  });
};

const editSystem = async (
  systemId: string,
  system: EditSystem
): Promise<System> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .patch<System>(`${apiUrl}/v1/systems/${systemId}`, system)
    .then((response) => response.data);
};

export const useEditSystem = (): UseMutationResult<
  System,
  AxiosError,
  { systemId: string; system: EditSystem }
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { systemId: string; system: EditSystem }) =>
      editSystem(data.systemId, data.system),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: (data: System) => {
        queryClient.invalidateQueries({
          queryKey: ['Systems', data.parent_id],
        });
        queryClient.invalidateQueries({
          queryKey: ['SystemBreadcrumbs', data.id],
        });
        queryClient.removeQueries({ queryKey: ['System', data.id] });
      },
    }
  );
};

const deleteSystem = async (systemId: string): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .delete(`${apiUrl}/v1/systems/${systemId}`)
    .then((response) => response.data);
};

export const useDeleteSystem = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation((systemId: string) => deleteSystem(systemId), {
    onError: (error) => {
      console.log(`Got error: '${error.message}'`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Systems'] });
      queryClient.removeQueries({ queryKey: ['System'] });
    },
  });
};
