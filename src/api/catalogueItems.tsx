import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { TransferState, TransferToCatalogueItem } from '../app.types';
import { imsApi } from './api';
import {
  APIError,
  CatalogueItem,
  CatalogueItemPatch,
  CatalogueItemPost,
} from './api.types';

const postCatalogueItem = async (
  catalogueItem: CatalogueItemPost
): Promise<CatalogueItem> => {
  return imsApi
    .post<CatalogueItem>(`/v1/catalogue-items`, catalogueItem)
    .then((response) => response.data);
};

export const usePostCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  CatalogueItemPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueItem: CatalogueItemPost) =>
      postCatalogueItem(catalogueItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
    },
  });
};

const getCatalogueItems = async (
  catalogueCategoryId: string | null
): Promise<CatalogueItem[]> => {
  const queryParams = new URLSearchParams();

  if (catalogueCategoryId)
    queryParams.append('catalogue_category_id', catalogueCategoryId);

  return imsApi
    .get(`/v1/catalogue-items`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useGetCatalogueItems = (
  catalogueCategoryId: string | null
): UseQueryResult<CatalogueItem[], AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueItems', catalogueCategoryId],
    queryFn: () => {
      return getCatalogueItems(catalogueCategoryId);
    },
  });
};

const getCatalogueItem = async (
  catalogueCategoryId: string | undefined
): Promise<CatalogueItem> => {
  const queryParams = new URLSearchParams();

  return imsApi
    .get(`/v1/catalogue-items/${catalogueCategoryId ?? ''}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useGetCatalogueItem = (
  catalogueCategoryId: string | undefined
): UseQueryResult<CatalogueItem, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueItem', catalogueCategoryId],
    queryFn: () => {
      return getCatalogueItem(catalogueCategoryId);
    },
    enabled: catalogueCategoryId !== undefined,
  });
};

export const useGetCatalogueItemIds = (
  ids: string[]
): UseQueryResult<CatalogueItem>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['CatalogueItem', id],
      queryFn: () => getCatalogueItem(id),
    })),
  });
};

const deleteCatalogueItem = async (catalogueItemId: string): Promise<void> => {
  return imsApi
    .delete(`/v1/catalogue-items/${catalogueItemId}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueItem = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueItemId: string) =>
      deleteCatalogueItem(catalogueItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
      queryClient.removeQueries({ queryKey: ['CatalogueItem'] });
    },
  });
};

const patchCatalogueItem = async (
  id: string,
  catalogueItem: CatalogueItemPatch
): Promise<CatalogueItem> => {
  return imsApi
    .patch<CatalogueItem>(`/v1/catalogue-items/${id}`, catalogueItem)
    .then((response) => response.data);
};

export const usePatchCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  { id: string; catalogueItem: CatalogueItemPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, catalogueItem }) =>
      patchCatalogueItem(id, catalogueItem),
    onSuccess: (catalogueItemResponse: CatalogueItem) => {
      queryClient.invalidateQueries({
        queryKey: [
          'CatalogueItems',
          catalogueItemResponse.catalogue_category_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItem', catalogueItemResponse.id],
      });
    },
  });
};

export const useMoveToCatalogueItem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  TransferToCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (moveToCatalogueItem: TransferToCatalogueItem) => {
      const transferStates: TransferState[] = [];
      // Ids for invalidation
      const successfulIds: string[] = [];
      const successfulCatalogueCategoryIds: string[] = [];

      const promises = moveToCatalogueItem.selectedCatalogueItems.map(
        async (catalogueItem: CatalogueItem) => {
          return patchCatalogueItem(catalogueItem.id, {
            catalogue_category_id:
              moveToCatalogueItem.targetCatalogueCategory?.id,
          })
            .then(() => {
              transferStates.push({
                name: catalogueItem.name,
                message: `Successfully moved to ${
                  moveToCatalogueItem.targetCatalogueCategory?.name || 'Root'
                }`,
                state: 'success',
              });
              successfulIds.push(catalogueItem.id);
              successfulCatalogueCategoryIds.push(
                catalogueItem.catalogue_category_id
              );
            })
            .catch((error) => {
              const response = error.response?.data as APIError;

              transferStates.push({
                name: catalogueItem.name,
                message: response.detail,
                state: 'error',
              });
            });
        }
      );

      await Promise.all(promises);

      if (successfulIds.length > 0) {
        queryClient.invalidateQueries({
          queryKey: [
            'CatalogueItems',
            moveToCatalogueItem.targetCatalogueCategory?.id,
          ],
        });
        // Also need to invalidate each catalogue categories we are moving from (likely just the one)
        const uniqueCatalogueCategoryIds = new Set(
          successfulCatalogueCategoryIds
        );
        uniqueCatalogueCategoryIds.forEach((catalogueCategoryIds: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueItems', catalogueCategoryIds],
          })
        );
        queryClient.invalidateQueries({ queryKey: ['CatalogueBreadcrumbs'] });
        successfulIds.forEach((id: string) =>
          queryClient.invalidateQueries({ queryKey: ['CatalogueItem', id] })
        );
      }

      return transferStates;
    },
  });
};

export const useCopyToCatalogueItem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  TransferToCatalogueItem
> => {
  const queryClient = useQueryClient();

  const successfulCatalogueCategoryIds: string[] = [];

  return useMutation({
    mutationFn: async (copyToCatalogueItem: TransferToCatalogueItem) => {
      const transferStates: TransferState[] = [];

      const promises = copyToCatalogueItem.selectedCatalogueItems.map(
        async (catalogueItem: CatalogueItem) => {
          // Information to post (backend will just ignore the extra here - only id and code)
          // Also use Object.assign to copy the data otherwise will modify in place causing issues
          // in tests

          const targetProperties =
            copyToCatalogueItem.targetCatalogueCategory?.properties;

          const properties = catalogueItem.properties.map((property) => {
            const targetPropertyId = targetProperties?.find(
              (targetProperty) => property.name === targetProperty.name
            )?.id;
            return { id: targetPropertyId, value: property.value };
          });

          const catalogueItemAdd: CatalogueItemPost = Object.assign(
            {},
            { ...catalogueItem, properties: properties }
          ) as CatalogueItemPost;

          // Assign new parent
          catalogueItemAdd.catalogue_category_id =
            copyToCatalogueItem.targetCatalogueCategory?.id ?? '';

          return postCatalogueItem(catalogueItemAdd)
            .then((result: CatalogueItem) => {
              const targetSystemName =
                copyToCatalogueItem.targetCatalogueCategory?.name || 'Root';
              transferStates.push({
                name: catalogueItem.name,
                message: `Successfully copied to ${targetSystemName}`,
                state: 'success',
              });

              successfulCatalogueCategoryIds.push(result.catalogue_category_id);
            })
            .catch((error) => {
              const response = error.response?.data as APIError;

              transferStates.push({
                name: catalogueItem.name,
                message: response.detail,
                state: 'error',
              });
            });
        }
      );

      await Promise.all(promises);

      if (successfulCatalogueCategoryIds.length > 0) {
        const uniqueCatalogueCategoryIds = new Set(
          successfulCatalogueCategoryIds
        );
        uniqueCatalogueCategoryIds.forEach((catalogueCategoryId: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueItems', catalogueCategoryId],
          })
        );
      }

      return transferStates;
    },
  });
};
