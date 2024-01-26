import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';
import {
  AddCatalogueItem,
  TransferState,
  CatalogueItem,
  EditCatalogueItem,
  ErrorParsing,
  TransferToCatalogueItem,
} from '../app.types';
import { settings } from '../settings';

const addCatalogueItem = async (
  catalogueItem: AddCatalogueItem
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueItem>(`${apiUrl}/v1/catalogue-items/`, catalogueItem)
    .then((response) => response.data);
};

export const useAddCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  AddCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueItem: AddCatalogueItem) => addCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
      },
    }
  );
};

const fetchCatalogueItems = async (
  catalogueCategoryId: string | null
): Promise<CatalogueItem[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  if (catalogueCategoryId)
    queryParams.append('catalogue_category_id', catalogueCategoryId);

  return axios
    .get(`${apiUrl}/v1/catalogue-items/`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueItems = (
  catalogueCategoryId: string | null
): UseQueryResult<CatalogueItem[], AxiosError> => {
  return useQuery<CatalogueItem[], AxiosError>(
    ['CatalogueItems', catalogueCategoryId],
    (params) => {
      return fetchCatalogueItems(catalogueCategoryId);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchCatalogueItem = async (
  catalogueCategoryId: string | undefined
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  return axios
    .get(`${apiUrl}/v1/catalogue-items/${catalogueCategoryId ?? ''}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueItem = (
  catalogueCategoryId: string | undefined
): UseQueryResult<CatalogueItem, AxiosError> => {
  return useQuery<CatalogueItem, AxiosError>(
    ['CatalogueItem', catalogueCategoryId],
    (params) => {
      return fetchCatalogueItem(catalogueCategoryId);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: catalogueCategoryId !== undefined,
    }
  );
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
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/catalogue-items/${catalogueItem.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueItem = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueItem: CatalogueItem) => deleteCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
        queryClient.removeQueries({ queryKey: ['CatalogueItem'] });
      },
    }
  );
};

const editCatalogueItem = async (
  catalogueItem: EditCatalogueItem
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const { id, ...updatedItem } = catalogueItem;
  return axios
    .patch<CatalogueItem>(`${apiUrl}/v1/catalogue-items/${id}`, updatedItem)
    .then((response) => response.data);
};

export const useEditCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  EditCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueItem: EditCatalogueItem) => editCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
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
    }
  );
};

export const useMoveToCatalogueItem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  TransferToCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(async (moveToCatalogueItem: TransferToCatalogueItem) => {
    const transferStates: TransferState[] = [];
    // Ids for invalidation
    const successfulIds: string[] = [];
    const successfulCatalogueCategoryIds: string[] = [];

    const promises = moveToCatalogueItem.selectedCatalogueItems.map(
      async (catalogueItem: CatalogueItem, index) => {
        return editCatalogueItem({
          id: catalogueItem.id,
          catalogue_category_id:
            moveToCatalogueItem.targetCatalogueCategory?.id,
        })
          .then((result) => {
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
            const response = error.response?.data as ErrorParsing;

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
  });
};

export const useCopyToCatalogueItem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  TransferToCatalogueItem
> => {
  const queryClient = useQueryClient();

  const successfulCatalogueCategoryIds: string[] = [];

  return useMutation(async (copyToCatalogueItem: TransferToCatalogueItem) => {
    const transferStates: TransferState[] = [];

    const promises = copyToCatalogueItem.selectedCatalogueItems.map(
      async (catalogueItem: CatalogueItem) => {
        // Information to post (backend will just ignore the extra here - only id and code)
        // Also use Object.assign to copy the data otherwise will modify in place causing issues
        // in tests
        const catalogueItemAdd: AddCatalogueItem = Object.assign(
          {},
          catalogueItem
        ) as AddCatalogueItem;

        // Assing new parent
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
            const response = error.response?.data as ErrorParsing;

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
  });
};
