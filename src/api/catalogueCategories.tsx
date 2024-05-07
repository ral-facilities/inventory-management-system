import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  AddCatalogueCategory,
  AddPropertyMigration,
  BreadcrumbsInfo,
  CatalogueCategory,
  CatalogueCategoryProperty,
  CopyToCatalogueCategory,
  EditCatalogueCategory,
  ErrorParsing,
  MoveToCatalogueCategory,
  EditPropertyMigration,
  TransferState,
} from '../app.types';

import handleTransferState from '../handleTransferState';
import { generateUniqueName } from '../utils';
import { imsApi } from './api';

const fetchCatalogueCategories = async (
  parent_id: string
): Promise<CatalogueCategory[]> => {
  const queryParams = new URLSearchParams();

  queryParams.append('parent_id', parent_id);

  return imsApi
    .get(`/v1/catalogue-categories`, {
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
  return useQuery({
    queryKey: ['CatalogueCategories', parent_id],
    queryFn: () => {
      return fetchCatalogueCategories(parent_id);
    },
    enabled: !isLeaf,
  });
};

const fetchCatalogueBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  return imsApi
    .get(`/v1/catalogue-categories/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueBreadcrumbs = (
  id?: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueBreadcrumbs', id],
    queryFn: () => {
      return fetchCatalogueBreadcrumbs(id ?? '');
    },
    enabled: !!id,
  });
};

const addCatalogueCategory = async (
  catalogueCategory: AddCatalogueCategory
): Promise<CatalogueCategory> => {
  return imsApi
    .post<CatalogueCategory>(`/v1/catalogue-categories`, catalogueCategory)
    .then((response) => response.data);
};

export const useAddCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  AddCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueCategory: AddCatalogueCategory) =>
      addCatalogueCategory(catalogueCategory),
    onSuccess: (category) => {
      queryClient.invalidateQueries({
        queryKey: ['CatalogueCategories', category.parent_id ?? 'null'],
      });
    },
  });
};

const addCatalogueCategoryProperty = async (
  addPropertyMigration: AddPropertyMigration
): Promise<CatalogueCategoryProperty> => {
  return imsApi
    .post<CatalogueCategoryProperty>(
      `/v1/catalogue-categories/${addPropertyMigration.catalogueCategory.id}/properties`,
      addPropertyMigration.property
    )
    .then((response) => response.data);
};

export const useAddCatalogueCategoryProperty = (): UseMutationResult<
  CatalogueCategoryProperty,
  AxiosError,
  AddPropertyMigration
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addPropertyMigration: AddPropertyMigration) => {
      handleTransferState([
        {
          name: addPropertyMigration.catalogueCategory.name,
          message: `Adding property ${addPropertyMigration.property.name} in ${addPropertyMigration.catalogueCategory.name}`,
          state: 'information',
        },
      ]);
      return addCatalogueCategoryProperty(addPropertyMigration);
    },
    onSuccess: (data, variables) => {
      const { name } = data;
      queryClient.invalidateQueries({
        queryKey: [
          'CatalogueCategories',
          variables.catalogueCategory.parent_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItems', variables.catalogueCategory.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items'],
      });

      handleTransferState([
        {
          name: variables.catalogueCategory.name,
          message: `Successfully added property ${name} in ${variables.catalogueCategory.name}`,
          state: 'success',
        },
      ]);
    },
    onError: (error, variables) => {
      const response = error.response?.data as ErrorParsing;

      handleTransferState([
        {
          name: variables.catalogueCategory.name,
          message: response.detail,
          state: 'error',
        },
      ]);
    },
  });
};

const editCatalogueCategoryProperty = async (
  editPropertyMigration: EditPropertyMigration
): Promise<CatalogueCategoryProperty> => {
  const { id, ...propertyBody } = editPropertyMigration.property;
  return imsApi
    .patch<CatalogueCategoryProperty>(
      `/v1/catalogue-categories/${editPropertyMigration.catalogueCategory.id}/properties/${editPropertyMigration.property.id}`,
      propertyBody
    )
    .then((response) => response.data);
};

export const useEditCatalogueCategoryProperty = (): UseMutationResult<
  CatalogueCategoryProperty,
  AxiosError,
  EditPropertyMigration
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (editPropertyMigration: EditPropertyMigration) => {
      handleTransferState([
        {
          name: editPropertyMigration.catalogueCategory.name,
          message: `Editing property ${editPropertyMigration.property.name} in ${editPropertyMigration.catalogueCategory.name}`,
          state: 'information',
        },
      ]);
      return editCatalogueCategoryProperty(editPropertyMigration);
    },
    onSuccess: (data, variables) => {
      const { name } = data;
      queryClient.invalidateQueries({
        queryKey: [
          'CatalogueCategories',
          variables.catalogueCategory.parent_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItems', variables.catalogueCategory.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items'],
      });
      handleTransferState([
        {
          name: variables.catalogueCategory.name,
          message: `Successfully edited property ${name} in ${variables.catalogueCategory.name}`,
          state: 'success',
        },
      ]);
    },
    onError: (error, variables) => {
      const response = error.response?.data as ErrorParsing;

      handleTransferState([
        {
          name: variables.catalogueCategory.name,
          message: response.detail,
          state: 'error',
        },
      ]);
    },
  });
};

const editCatalogueCategory = async (
  catalogueCategory: EditCatalogueCategory
): Promise<CatalogueCategory> => {
  const { id, ...updatedCategory } = catalogueCategory;
  return imsApi
    .patch<CatalogueCategory>(`/v1/catalogue-categories/${id}`, updatedCategory)
    .then((response) => response.data);
};

export const useEditCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  EditCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueCategory: EditCatalogueCategory) =>
      editCatalogueCategory(catalogueCategory),
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
  });
};

export const useMoveToCatalogueCategory = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveToCatalogueCategory
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moveToCatalogueCategory: MoveToCatalogueCategory) => {
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
  });
};

export const useCopyToCatalogueCategory = (): UseMutationResult<
  TransferState[],
  AxiosError,
  CopyToCatalogueCategory
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (copyToCatalogueCategory: CopyToCatalogueCategory) => {
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

          // Avoid duplicates
          categoryAdd.name = generateUniqueName(
            categoryAdd.name,
            copyToCatalogueCategory.existingCategoryNames
          );

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
  });
};
const deleteCatalogueCategory = async (
  catalogueCategory: CatalogueCategory
): Promise<void> => {
  return imsApi
    .delete(`/v1/catalogue-categories/${catalogueCategory.id}`)
    .then((response) => response.data);
};

export const useDeleteCatalogueCategory = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueCategory: CatalogueCategory) =>
      deleteCatalogueCategory(catalogueCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueCategories'] });
    },
  });
};

const fetchCatalogueCategory = async (
  id: string | undefined
): Promise<CatalogueCategory> => {
  return imsApi.get(`/v1/catalogue-categories/${id}`, {}).then((response) => {
    return response.data;
  });
};

export const useCatalogueCategory = (
  id?: string | null
): UseQueryResult<CatalogueCategory, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueCategory', id],
    queryFn: () => {
      return fetchCatalogueCategory(id ?? '');
    },
    enabled: !!id,
  });
};
