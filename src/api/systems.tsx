import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  AddSystem,
  BreadcrumbsInfo,
  CopyToSystem,
  EditSystem,
  ErrorParsing,
  MoveToSystem,
  System,
  SystemImportanceType,
  TransferState,
} from '../app.types';
import { generateUniqueNameUsingCode } from '../utils';
import { imsApi } from './api';

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
  const queryParams = new URLSearchParams();

  if (parent_id) queryParams.append('parent_id', parent_id);

  return imsApi.get(`/v1/systems`, { params: queryParams }).then((response) => {
    return response.data;
  });
};

export const useSystemIds = (ids: string[]): UseQueryResult<System>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['System', id],
      queryFn: () => fetchSystem(id),
    })),
  });
};

export const useSystems = (
  parent_id?: string
): UseQueryResult<System[], AxiosError> => {
  return useQuery({
    queryKey: ['Systems', parent_id],
    queryFn: () => {
      return fetchSystems(parent_id);
    },
  });
};

const fetchSystem = async (id: string): Promise<System> => {
  return imsApi.get(`/v1/systems/${id}`).then((response) => {
    return response.data;
  });
};

// Allows a value of undefined or null to disable
export const useSystem = (
  id?: string | null
): UseQueryResult<System, AxiosError> => {
  return useQuery({
    queryKey: ['System', id],
    queryFn: () => {
      return fetchSystem(id ?? '');
    },
    enabled: !!id,
  });
};

const fetchSystemsBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  return imsApi.get(`/v1/systems/${id}/breadcrumbs`, {}).then((response) => {
    return response.data;
  });
};

export const useSystemsBreadcrumbs = (
  id?: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery({
    queryKey: ['SystemBreadcrumbs', id],
    queryFn: () => {
      return fetchSystemsBreadcrumbs(id ?? '');
    },
    enabled: !!id,
  });
};

const addSystem = async (system: AddSystem): Promise<System> => {
  return imsApi
    .post<System>(`/v1/systems`, system)
    .then((response) => response.data);
};

export const useAddSystem = (): UseMutationResult<
  System,
  AxiosError,
  AddSystem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (system: AddSystem) => addSystem(system),
    onSuccess: (systemResponse) => {
      queryClient.invalidateQueries({
        queryKey: ['Systems', systemResponse.parent_id ?? 'null'],
      });
    },
  });
};

const editSystem = async (system: EditSystem): Promise<System> => {
  const { id, ...updateData } = system;

  return imsApi
    .patch<System>(`/v1/systems/${id}`, updateData)
    .then((response) => response.data);
};

export const useEditSystem = (): UseMutationResult<
  System,
  AxiosError,
  EditSystem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (system: EditSystem) => editSystem(system),
    onSuccess: (systemResponse: System) => {
      queryClient.invalidateQueries({
        queryKey: ['Systems', systemResponse.parent_id ?? 'null'],
      });
      queryClient.invalidateQueries({
        // Don't use ID here as will also need to update any of its children as well
        queryKey: ['SystemBreadcrumbs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['System', systemResponse.id],
      });
    },
  });
};

const deleteSystem = async (systemId: string): Promise<void> => {
  return imsApi
    .delete(`/v1/systems/${systemId}`)
    .then((response) => response.data);
};

export const useDeleteSystem = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (systemId: string) => deleteSystem(systemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Systems'] });
      queryClient.removeQueries({ queryKey: ['System'] });
    },
  });
};

export const useMoveToSystem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveToSystem
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moveToSystem: MoveToSystem) => {
      const transferStates: TransferState[] = [];

      // Ids for invalidation (parentIds must be a string value of 'null' for invalidation)
      const successfulIds: string[] = [];
      const successfulParentIds: string[] = [];

      const promises = moveToSystem.selectedSystems.map(
        async (system: System) => {
          return editSystem({
            id: system.id,
            parent_id: moveToSystem.targetSystem?.id || null,
          })
            .then(() => {
              const targetSystemName =
                moveToSystem.targetSystem?.name || 'Root';
              transferStates.push({
                name: system.name,
                message: `Successfully moved to ${targetSystemName}`,
                state: 'success',
              });

              successfulIds.push(system.id);
              successfulParentIds.push(system.parent_id || 'null');
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;

              transferStates.push({
                name: system.name,
                message: response.detail,
                state: 'error',
              });
            });
        }
      );

      await Promise.all(promises);

      if (successfulIds.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['Systems', moveToSystem.targetSystem?.id || 'null'],
        });
        // Also need to invalidate each parent we are moving from (likely just the one)
        const uniqueParentIds = new Set(successfulParentIds);
        uniqueParentIds.forEach((parentId: string) =>
          queryClient.invalidateQueries({
            queryKey: ['Systems', parentId],
          })
        );
        queryClient.invalidateQueries({ queryKey: ['SystemBreadcrumbs'] });
        successfulIds.forEach((id: string) =>
          queryClient.invalidateQueries({ queryKey: ['System', id] })
        );
      }

      return transferStates;
    },
  });
};

export const useCopyToSystem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  CopyToSystem
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (copyToSystem: CopyToSystem) => {
      const transferStates: TransferState[] = [];

      const successfulIds: string[] = [];

      const promises = copyToSystem.selectedSystems.map(
        async (system: System) => {
          // Data to post (backend will just ignore the extra here - only id and code)
          // Also use Object.assign to copy the data otherwise will modify in place causing issues
          // in tests
          const systemAdd: AddSystem = Object.assign({}, system) as AddSystem;

          // Assign new parent
          systemAdd.parent_id = copyToSystem.targetSystem?.id || null;

          // Avoid duplicates
          systemAdd.name = generateUniqueNameUsingCode(
            systemAdd.name,
            system.code,
            copyToSystem.existingSystemCodes
          );

          return addSystem(systemAdd)
            .then((result: System) => {
              const targetSystemName =
                copyToSystem.targetSystem?.name || 'Root';
              transferStates.push({
                name: system.name,
                message: `Successfully copied to ${targetSystemName}`,
                state: 'success',
              });

              successfulIds.push(result.id);
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;

              transferStates.push({
                name: system.name,
                message: response.detail,
                state: 'error',
              });
            });
        }
      );

      await Promise.all(promises);

      if (successfulIds.length > 0)
        queryClient.invalidateQueries({
          queryKey: ['Systems', copyToSystem.targetSystem?.id || 'null'],
        });

      return transferStates;
    },
  });
};
