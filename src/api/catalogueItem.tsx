import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AddCatalogueItem,
  TransferState,
  CatalogueItem,
  EditCatalogueItem,
  MoveToCatalogueItem,
  ErrorParsing,
} from '../app.types';
import { settings } from '../settings';

const addCatalogueItem = async (
  catalogueCategory: AddCatalogueItem
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueItem>(`${apiUrl}/v1/catalogue-items/`, catalogueCategory)
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
        queryClient.invalidateQueries({ queryKey: ['CatalogueItem'] });
      },
    }
  );
};

export const useMoveToCatalogueItem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveToCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(async (MoveToCatalogueItem: MoveToCatalogueItem) => {
    const transferStates: TransferState[] = [];
    let hasSuccessfulEdit = false;

    const targetLocationInfo = {
      name: MoveToCatalogueItem.targetLocationCatalogueCategory?.name ?? 'Root',
      id: MoveToCatalogueItem.targetLocationCatalogueCategory?.id ?? null,
    };

    const promises = MoveToCatalogueItem.catalogueItems.map(
      async (item: EditCatalogueItem, index) => {
        const { name, ...itemWithoutName } = item;

        if (
          MoveToCatalogueItem.selectedItems[index].catalogue_category_id ===
          item.catalogue_category_id
        ) {
          const errorTransferState: TransferState = {
            name: item.name ?? '',
            message:
              'The destination cannot be the same as the catalogue item itself',
            state: 'error',
          };
          transferStates.push(errorTransferState);

          return;
        }

        return editCatalogueItem(itemWithoutName)
          .then((result) => {
            const successTransferState: TransferState = {
              name: result.name ?? '',
              message: `Successfully moved to ${targetLocationInfo.name}`,
              state: 'success',
            };
            transferStates.push(successTransferState);
            hasSuccessfulEdit = true;
          })
          .catch((error) => {
            const response = error.response?.data as ErrorParsing;

            const selectedItem = MoveToCatalogueItem.selectedItems.find(
              (selectedItem) => selectedItem.id === item.id
            );
            const errorTransferState: TransferState = {
              name: selectedItem?.name ?? '',
              message: response.detail ?? '',
              state: 'error',
            };
            transferStates.push(errorTransferState);
          });
      }
    );

    await Promise.all(promises);

    if (hasSuccessfulEdit) {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
      queryClient.invalidateQueries({ queryKey: ['CatalogueBreadcrumbs'] });
    }

    return transferStates;
  });
};
