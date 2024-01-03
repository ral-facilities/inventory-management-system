import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
  AddCatalogueCategory,
  BreadcrumbsInfo,
  CatalogueCategory,
  CopyToCatalogueCategory,
  EditCatalogueCategory,
  ErrorParsing,
  MoveToCatalogueCategory,
  TransferState,
} from '../app.types';
import { settings } from '../settings';

const fetchCatalogueCategories = async (
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

export const useCatalogueCategories = (
  isLeaf: boolean,
  parent_id: string
): UseQueryResult<CatalogueCategory[], AxiosError> => {
  return useQuery<CatalogueCategory[], AxiosError>(
    ['CatalogueCategories', parent_id],
    (params) => {
      return fetchCatalogueCategories(parent_id);
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
      onSuccess: (category) => {
        queryClient.invalidateQueries({
          queryKey: ['CatalogueCategories', category.parent_id ?? 'null'],
        });
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
      onSuccess: (category) => {
        queryClient.invalidateQueries({
          queryKey: ['CatalogueCategories', category.parent_id ?? 'null'],
        });
        queryClient.invalidateQueries({
          // Don't use ID here as will also need to update any of its children as well
          queryKey: ['CatalogueBreadcrumbs'],
        });
        queryClient.invalidateQueries({
          queryKey: ['CatalogueCategory', category.id],
        });
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
            'CatalogueCategories',
            moveToCatalogueCategory.targetCategory?.id || 'null',
          ],
        });
        // Also need to invalidate each parent we are moving from (likely just the one)
        const uniqueParentIds = new Set(successfulParentIds);
        uniqueParentIds.forEach((parentId: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueCategories', parentId],
          })
        );
        queryClient.invalidateQueries({ queryKey: ['CatalogueBreadcrumbs'] });
        successfulIds.forEach((id: string) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueCategory', id],
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

      // Ids for invalidation (must be a string value of 'null' if null
      // for invalidation)
      const successfulParentIds: string[] = [];

      const promises = copyToCatalogueCategory.selectedCategories.map(
        async (category: CatalogueCategory) => {
          // Data to post (backend will just ignore the extra here - only id and code)
          // Also use Object.assign to copy the data otherwise will modify in place causing issues
          // in tests
          const categoryAdd: AddCatalogueCategory = Object.assign(
            {},
            category
          ) as AddCatalogueCategory;

          // Assign new parent
          categoryAdd.parent_id =
            copyToCatalogueCategory.targetCategory?.id || null;

          // Avoid duplicates by appending _copy_n for nth copy
          if (
            copyToCatalogueCategory.existingCategoryCodes.includes(
              category.code
            )
          ) {
            let count = 1;
            let newName = categoryAdd.name;
            let newCode = category.code;

            while (
              copyToCatalogueCategory.existingCategoryCodes.includes(newCode)
            ) {
              newName = `${categoryAdd.name}_copy_${count}`;
              newCode = `${category.code}_copy_${count}`;
              count++;
            }

            categoryAdd.name = newName;
          }

          return addCatalogueCategory(categoryAdd)
            .then((result) => {
              const targetCategoryName =
                copyToCatalogueCategory.targetCategory?.name || 'Root';
              transferStates.push({
                name: result.name,
                message: `Successfully copied to ${targetCategoryName}`,
                state: 'success',
              });

              successfulParentIds.push(result.parent_id || 'null');
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

      if (successfulParentIds.length > 0)
        // Only invalidate the unique parents
        new Set(successfulParentIds).forEach((parentId) =>
          queryClient.invalidateQueries({
            queryKey: ['CatalogueCategories', parentId],
          })
        );

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
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategories'] });
      },
    }
  );
};

const fetchCatalogueCategory = async (
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

export const useCatalogueCategory = (
  id: string | undefined
): UseQueryResult<CatalogueCategory, AxiosError> => {
  return useQuery<CatalogueCategory, AxiosError>(
    ['CatalogueCategory', id],
    (params) => {
      return fetchCatalogueCategory(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== undefined,
    }
  );
};
