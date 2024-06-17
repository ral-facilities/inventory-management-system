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
  APIError,
  AddCatalogueItem,
  CatalogueItem,
  EditCatalogueItem,
  TransferState,
  TransferToCatalogueItem,
} from '../app.types';
import { imsApi } from './api';

const addCatalogueItem = async (
  catalogueItem: AddCatalogueItem
): Promise<CatalogueItem> => {
  return imsApi
    .post<CatalogueItem>(`/v1/catalogue-items`, catalogueItem)
    .then((response) => response.data);
};

export const useAddCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  AddCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueItem: AddCatalogueItem) =>
      addCatalogueItem(catalogueItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
    },
  });
};

const fetchCatalogueItems = async (
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

export const useCatalogueItems = (
  catalogueCategoryId: string | null
): UseQueryResult<CatalogueItem[], AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueItems', catalogueCategoryId],
    queryFn: () => {
      return fetchCatalogueItems(catalogueCategoryId);
    },
  });
};

const fetchCatalogueItem = async (
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

export const useCatalogueItem = (
  catalogueCategoryId: string | undefined
): UseQueryResult<CatalogueItem, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueItem', catalogueCategoryId],
    queryFn: () => {
      return fetchCatalogueItem(catalogueCategoryId);
    },
    enabled: catalogueCategoryId !== undefined,
  });
};

export const useCatalogueItemIds = (
  ids: string[]
): UseQueryResult<CatalogueItem>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['CatalogueItem', id],
      queryFn: () => fetchCatalogueItem(id),
    })),
  });
};

const deleteCatalogueItem = async (
  catalogueItem: CatalogueItem
): Promise<void> => {
  return imsApi
    .delete(`/v1/catalogue-items/${catalogueItem.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueItem = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueItem: CatalogueItem) =>
      deleteCatalogueItem(catalogueItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
      queryClient.removeQueries({ queryKey: ['CatalogueItem'] });
    },
  });
};

const editCatalogueItem = async (
  catalogueItem: EditCatalogueItem
): Promise<CatalogueItem> => {
  const { id, ...updatedItem } = catalogueItem;
  return imsApi
    .patch<CatalogueItem>(`/v1/catalogue-items/${id}`, updatedItem)
    .then((response) => response.data);
};

export const useEditCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  EditCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueItem: EditCatalogueItem) =>
      editCatalogueItem(catalogueItem),
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
          return editCatalogueItem({
            id: catalogueItem.id,
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
            copyToCatalogueItem.targetCatalogueCategory
              ?.catalogue_item_properties;

          const properties = catalogueItem.properties.map((property) => {
            const targetPropertyId = targetProperties?.find(
              (targetProperty) => property.name === targetProperty.name
            )?.id;
            return { id: targetPropertyId, value: property.value };
          });

          const catalogueItemAdd: AddCatalogueItem = Object.assign(
            {},
            { ...catalogueItem, properties: properties }
          ) as AddCatalogueItem;

          // Assign new parent
          catalogueItemAdd.catalogue_category_id =
            copyToCatalogueItem.targetCatalogueCategory?.id ?? '';

          return addCatalogueItem(catalogueItemAdd)
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
