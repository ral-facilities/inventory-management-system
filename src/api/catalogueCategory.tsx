import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  AddCatalogueCategory,
  BreadcrumbsInfo,
  CatalogueCategory,
  TransferState,
  CopyToCatalogueCategory,
  EditCatalogueCategory,
  ErrorParsing,
  MoveToCatalogueCategory,
} from '../app.types';
import { settings } from '../settings';

const fetchCatalogueCategory = async (
  parent_id: string
): Promise<CatalogueCategory[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  queryParams.append('parent_id', parent_id);

  return axios
    .get(`${apiUrl}/v1/catalogue-categories/`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueCategory = (
  isLeaf: boolean,
  parent_id: string
): UseQueryResult<CatalogueCategory[], AxiosError> => {
  return useQuery<CatalogueCategory[], AxiosError>(
    ['CatalogueCategory', parent_id],
    (params) => {
      return fetchCatalogueCategory(parent_id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: !isLeaf,
    }
  );
};

const fetchCatalogueBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/catalogue-categories/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueBreadcrumbs = (
  id: string
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery<BreadcrumbsInfo, AxiosError>(
    ['CatalogueBreadcrumbs', id],
    (params) => {
      return fetchCatalogueBreadcrumbs(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== '',
    }
  );
};

const addCatalogueCategory = async (
  catalogueCategory: AddCatalogueCategory
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueCategory>(
      `${apiUrl}/v1/catalogue-categories`,
      catalogueCategory
    )
    .then((response) => response.data);
};

export const useAddCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  AddCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: AddCatalogueCategory) =>
      addCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      },
    }
  );
};

const editCatalogueCategory = async (
  catalogueCategory: EditCatalogueCategory
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const { id, ...updatedCategory } = catalogueCategory;
  return axios
    .patch<CatalogueCategory>(
      `${apiUrl}/v1/catalogue-categories/${id}`,
      updatedCategory
    )
    .then((response) => response.data);
};

export const useEditCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  EditCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: EditCatalogueCategory) =>
      editCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategoryById'] });
      },
    }
  );
};

export const useMoveToCatalogueCategory = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveToCatalogueCategory
> => {
  const queryClient = useQueryClient();

  return useMutation(
    async (moveToCatalogueCategory: MoveToCatalogueCategory) => {
      const transferStates: TransferState[] = [];

      // Ids for invalidation (parentIds must be a string value of 'null' for invalidation)
      const successfulIds: string[] = [];
      const successfulParentIds: string[] = [];

      const promises = moveToCatalogueCategory.selectedCategories.map(
        async (category: CatalogueCategory) => {
          return editCatalogueCategory({
            id: category.id,
            parent_id: moveToCatalogueCategory.targetCategory?.id || null,
          })
            .then((result) => {
              transferStates.push({
                name: result.name ?? '',
                message: `Successfully moved to ${
                  moveToCatalogueCategory.targetCategory?.name || 'Root'
                }`,
                state: 'success',
              });

              successfulIds.push(category.id);
              successfulParentIds.push(category.parent_id || 'null');
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;

              transferStates.push({
                name: category.name,
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
            'CatalogueCategory',
            moveToCatalogueCategory.targetCategory?.id || 'null',
          ],
        });
        // Also need to invalidate each parent we are moving from (likely just the one)
        const uniqueParentIds = new Set(successfulParentIds);
        uniqueParentIds.forEach((parentId: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueCategory', parentId],
          })
        );
        queryClient.invalidateQueries({ queryKey: ['CatalogueBreadcrumbs'] });
        successfulIds.forEach((id: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueCategoryById', id],
          })
        );
      }

      return transferStates;
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

export const useCopyToCatalogueCategory = (): UseMutationResult<
  TransferState[],
  AxiosError,
  CopyToCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    async (copyToCatalogueCategory: CopyToCatalogueCategory) => {
      const transferStates: TransferState[] = [];
      let hasSuccessfulAdd = false;

      const targetLocationInfo = {
        name: copyToCatalogueCategory.targetLocationCatalogueCategory.name,
        id: copyToCatalogueCategory.targetLocationCatalogueCategory.id,
      };

      const promises = copyToCatalogueCategory.catalogueCategories.map(
        async (category: AddCatalogueCategory, index) => {
          return addCatalogueCategory(category)
            .then((result) => {
              const successTransferState: TransferState = {
                name: result.name ?? '',
                message: `Successfully copied to ${targetLocationInfo.name}`,
                state: 'success',
              };
              transferStates.push(successTransferState);
              hasSuccessfulAdd = true;
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;
              const errorTransferState: TransferState = {
                name: category.name ?? '',
                message: response.detail,
                state: 'error',
              };
              transferStates.push(errorTransferState);
            });
        }
      );

      await Promise.all(promises);

      if (hasSuccessfulAdd) {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      }

      return transferStates;
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
const deleteCatalogueCategory = async (
  catalogueCategory: CatalogueCategory
): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/catalogue-categories/${catalogueCategory.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueCategory = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: CatalogueCategory) =>
      deleteCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      },
    }
  );
};

const fetchCatalogueCategoryById = async (
  id: string | undefined
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/catalogue-categories/${id}`, {})
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueCategoryById = (
  id: string | undefined
): UseQueryResult<CatalogueCategory, AxiosError> => {
  return useQuery<CatalogueCategory, AxiosError>(
    ['CatalogueCategoryById', id],
    (params) => {
      return fetchCatalogueCategoryById(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== undefined,
    }
  );
};
