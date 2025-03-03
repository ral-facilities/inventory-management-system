import {
  UseMutationResult,
  UseQueryResult,
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  CopyToSystem,
  MoveToSystem,
  TransferState,
  type GetQueryOptionsType,
} from '../app.types';
import { generateUniqueNameUsingCode } from '../utils';
import { imsApi } from './api';
import {
  APIError,
  BreadcrumbsInfo,
  System,
  SystemImportanceType,
  SystemPatch,
  SystemPost,
  type CatalogueItem,
} from './api.types';
import { getCatalogueItemQuery } from './catalogueItems';
import { getItemsQuery } from './items';

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

const getSystems = async (parent_id?: string): Promise<System[]> => {
  const queryParams = new URLSearchParams();

  if (parent_id) queryParams.append('parent_id', parent_id);

  return imsApi.get(`/v1/systems`, { params: queryParams }).then((response) => {
    return response.data;
  });
};

export const useGetSystemIds = (ids: string[]): UseQueryResult<System>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['System', id],
      queryFn: () => getSystem(id),
    })),
  });
};

export const getSystemsQuery = (
  id?: string,
  extraOptions?: GetQueryOptionsType<System[]>
) =>
  queryOptions<System[], AxiosError>({
    queryKey: ['Systems', id],
    queryFn: () => {
      return getSystems(id);
    },
    ...extraOptions,
  });

export const useGetSystems = (
  parent_id?: string
): UseQueryResult<System[], AxiosError> => {
  return useQuery(getSystemsQuery(parent_id));
};

const getSystem = async (id: string): Promise<System> => {
  return imsApi.get(`/v1/systems/${id}`).then((response) => {
    return response.data;
  });
};

export const getSystemQuery = (
  id?: string | null,
  extraOptions?: GetQueryOptionsType<System>
) =>
  queryOptions<System, AxiosError>({
    queryKey: ['System', id],
    queryFn: () => {
      return getSystem(id ?? '');
    },
    enabled: !!id,
    ...extraOptions,
  });

// Allows a value of undefined or null to disable
export const useGetSystem = (
  id?: string | null
): UseQueryResult<System, AxiosError> => {
  return useQuery(getSystemQuery(id));
};

export interface SystemTree extends Partial<System> {
  catalogueItems: (CatalogueItem & { itemsQuantity: number })[];
  subsystems?: SystemTree[];
}

const GET_SYSTEM_TREE_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5,
};

const getSystemTree = async (
  queryClient: QueryClient,
  parent_id: string,
  maxSubsystems: number, // Total max subsystems allowed
  maxDepth?: number,
  currentDepth: number = 0, // Default value
  subsystemsCutOffPoint?: number, // Total cutoff point
  totalSubsystems: { count: number } = { count: 0 }, // Shared counter object
  catalogueItemCache: Map<string, CatalogueItem> = new Map() // Shared cache for catalogue items
): Promise<SystemTree[]> => {
  // Stop recursion if currentDepth exceeds maxDepth
  if (maxDepth !== undefined && currentDepth >= maxDepth) {
    return [];
  }

  // Fetch the root system

  let rootSystem: System = {
    name: 'Root',
    code: 'root',
    id: 'root',
    created_time: '',
    modified_time: '',
    description: null,
    location: null,
    owner: null,
    importance: SystemImportanceType.LOW,
    parent_id: null,
  };

  if (parent_id !== 'null')
    rootSystem = await queryClient.fetchQuery(
      getSystemQuery(parent_id, GET_SYSTEM_TREE_QUERY_OPTIONS)
    );

  // Fetch systems at the current level
  const systems = await queryClient.fetchQuery(
    getSystemsQuery(parent_id, GET_SYSTEM_TREE_QUERY_OPTIONS)
  );

  // Increment the total count of subsystems
  totalSubsystems.count += systems.length;

  // Throw an AxiosError if the total count exceeds maxSubsystems
  if (maxSubsystems !== undefined && totalSubsystems.count > maxSubsystems) {
    throw new Error(
      `Total subsystems exceeded the maximum allowed limit of ${maxSubsystems}. Current count: ${totalSubsystems.count}`
    );
  }

  // Stop recursion if totalSubsystems count exceeds the cutoff point
  if (
    subsystemsCutOffPoint !== undefined &&
    totalSubsystems.count > subsystemsCutOffPoint
  ) {
    return systems.map((system) => ({
      ...system,
      subsystems: [],
      catalogueItems: [],
    }));
  }

  // Fetch subsystems and catalogue items for each system recursively
  const systemsWithTree: SystemTree[] = await Promise.all(
    systems.map(async (system) => {
      // Fetch subsystems recursively, increasing the depth
      const subsystems = await getSystemTree(
        queryClient,
        system.id,
        maxSubsystems,
        maxDepth,
        currentDepth + 1,
        subsystemsCutOffPoint,
        totalSubsystems,
        catalogueItemCache
      );

      // Fetch all items for the current system
      const items = await queryClient.fetchQuery(
        getItemsQuery(system.id, undefined, GET_SYSTEM_TREE_QUERY_OPTIONS)
      );

      // Group items into catalogue categories and fetch catalogue item details
      const catalogueItemIdSet = new Set<string>(
        items.map((item) => item.catalogue_item_id)
      );

      const catalogueItems: SystemTree['catalogueItems'] = await Promise.all(
        Array.from(catalogueItemIdSet).map(async (id) => {
          // Check if the item exists in the cache
          if (!catalogueItemCache.has(id)) {
            // If not, fetch and store it in the cache
            const fetchedCatalogueItem = await queryClient.fetchQuery(
              getCatalogueItemQuery(id, GET_SYSTEM_TREE_QUERY_OPTIONS)
            );
            catalogueItemCache.set(id, fetchedCatalogueItem);
          }

          // Retrieve the item from the cache
          const catalogueItem = catalogueItemCache.get(id)!;
          const categoryItems = items.filter(
            (item) => item.catalogue_item_id === id
          );
          return { ...catalogueItem, itemsQuantity: categoryItems.length };
        })
      );

      return { ...system, subsystems, catalogueItems };
    })
  );

  // Handle the case when there are no systems (leaf nodes or empty levels)
  const items = await queryClient.fetchQuery(
    getItemsQuery(parent_id, undefined, GET_SYSTEM_TREE_QUERY_OPTIONS)
  );

  // Group items into catalogue categories and fetch catalogue item details
  const catalogueItemIdSet = new Set<string>(
    items.map((item) => item.catalogue_item_id)
  );

  const catalogueItems: SystemTree['catalogueItems'] = await Promise.all(
    Array.from(catalogueItemIdSet).map(async (id) => {
      // Check if the item exists in the cache
      if (!catalogueItemCache.has(id)) {
        // If not, fetch and store it in the cache
        const fetchedCatalogueItem = await queryClient.fetchQuery(
          getCatalogueItemQuery(id, GET_SYSTEM_TREE_QUERY_OPTIONS)
        );
        catalogueItemCache.set(id, fetchedCatalogueItem);
      }

      // Retrieve the item from the cache
      const catalogueItem = catalogueItemCache.get(id)!;
      const categoryItems = items.filter(
        (item) => item.catalogue_item_id === id
      );
      return { ...catalogueItem, itemsQuantity: categoryItems.length };
    })
  );

  return [
    {
      ...rootSystem,
      catalogueItems,
      subsystems: systemsWithTree,
    },
  ];
};

export const useGetSystemsTree = (
  parent_id?: string | null,
  maxDepth?: number,
  subsystemsCutOffPoint?: number, // Add cutoff point as a parameter
  maxSubsystems?: number
): UseQueryResult<SystemTree[], AxiosError> => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [
      'SystemsTree',
      parent_id,
      maxSubsystems,
      maxDepth,
      subsystemsCutOffPoint,
    ],
    queryFn: () =>
      getSystemTree(
        queryClient,
        parent_id ?? 'null',
        maxSubsystems ?? 150,
        maxDepth,
        0,
        subsystemsCutOffPoint
      ),
    ...GET_SYSTEM_TREE_QUERY_OPTIONS,
  });
};

const getSystemsBreadcrumbs = async (id: string): Promise<BreadcrumbsInfo> => {
  return imsApi.get(`/v1/systems/${id}/breadcrumbs`, {}).then((response) => {
    return response.data;
  });
};

export const useGetSystemsBreadcrumbs = (
  id?: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery({
    queryKey: ['SystemBreadcrumbs', id],
    queryFn: () => {
      return getSystemsBreadcrumbs(id ?? '');
    },
    enabled: !!id,
  });
};

const postSystem = async (system: SystemPost): Promise<System> => {
  return imsApi
    .post<System>(`/v1/systems`, system)
    .then((response) => response.data);
};

export const usePostSystem = (): UseMutationResult<
  System,
  AxiosError,
  SystemPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (system: SystemPost) => postSystem(system),
    onSuccess: (systemResponse) => {
      queryClient.invalidateQueries({
        queryKey: ['Systems', systemResponse.parent_id ?? 'null'],
      });
    },
  });
};

const patchSystem = async (
  id: string,
  system: SystemPatch
): Promise<System> => {
  return imsApi
    .patch<System>(`/v1/systems/${id}`, system)
    .then((response) => response.data);
};

export const usePatchSystem = (): UseMutationResult<
  System,
  AxiosError,
  { id: string; system: SystemPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, system }) => patchSystem(id, system),
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
          return patchSystem(system.id, {
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
              const response = error.response?.data as APIError;

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
          const systemAdd: SystemPost = Object.assign({}, system) as SystemPost;

          // Assign new parent
          systemAdd.parent_id = copyToSystem.targetSystem?.id || null;

          // Avoid duplicates
          systemAdd.name = generateUniqueNameUsingCode(
            systemAdd.name,
            system.code,
            copyToSystem.existingSystemCodes
          );

          return postSystem(systemAdd)
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
              const response = error.response?.data as APIError;

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
