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
  CatalogueCategoryTransferState,
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
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategoryByID'] });
      },
    }
  );
};

export const useMoveToCatalogueCategory = (): UseMutationResult<
  CatalogueCategoryTransferState[],
  AxiosError,
  MoveToCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    async (moveToCatalogueCategory: MoveToCatalogueCategory) => {
      const transferStates: CatalogueCategoryTransferState[] = [];
      let hasSuccessfulEdit = false;

      const targetLocationInfo = {
        name: moveToCatalogueCategory.targetLocationCatalogueCategory.name,
        id: moveToCatalogueCategory.targetLocationCatalogueCategory.id,
      };

      const promises = moveToCatalogueCategory.catalogueCategory.map(
        async (category: EditCatalogueCategory, index) => {
          const { name, ...categoryWithoutName } = category;

          if (
            moveToCatalogueCategory.selectedCategories[index].parent_id ===
            category.parent_id
          ) {
            const errorTransferState: CatalogueCategoryTransferState = {
              name: category.name ?? '',
              message:
                'The destination cannot be the same as the catalogue category itself',
              state: 'error',
            };
            transferStates.push(errorTransferState);

            return;
          }
          return editCatalogueCategory(categoryWithoutName)
            .then((result) => {
              const successTransferState: CatalogueCategoryTransferState = {
                name: result.name ?? '',
                message: `Successfully moved to ${targetLocationInfo.name}`,
                state: 'success',
              };
              transferStates.push(successTransferState);
              hasSuccessfulEdit = true;
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;

              const selectedCategory =
                moveToCatalogueCategory.selectedCategories.find(
                  (selectedCategory) => selectedCategory.id === category.id
                );
              const errorTransferState: CatalogueCategoryTransferState = {
                name: selectedCategory?.name ?? '',
                message: response.detail,
                state: 'error',
              };
              transferStates.push(errorTransferState);
            });
        }
      );

      await Promise.all(promises);

      if (hasSuccessfulEdit) {
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
    ['CatalogueCategoryByID', id],
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
