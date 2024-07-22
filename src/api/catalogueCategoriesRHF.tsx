import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { TransferState } from '../app.types';

import handleTransferState from '../handleTransferState';
import { generateUniqueNameUsingCode } from '../utils';
import { imsApi } from './api';
import {
  APIError,
  BreadcrumbsInfo,
  CatalogueCategory,
  CatalogueCategoryPatch,
  CatalogueCategoryPost,
  CatalogueCategoryProperty,
  CatalogueCategoryPropertyPatch,
  CatalogueCategoryPropertyPost,
} from './api.types';

const getCatalogueCategories = async (
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

export const useGetCatalogueCategories = (
  isLeaf: boolean,
  parent_id: string
): UseQueryResult<CatalogueCategory[], AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueCategories', parent_id],
    queryFn: () => {
      return getCatalogueCategories(parent_id);
    },
    enabled: !isLeaf,
  });
};

const getCatalogueBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  return imsApi
    .get(`/v1/catalogue-categories/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useGetCatalogueBreadcrumbs = (
  id?: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueBreadcrumbs', id],
    queryFn: () => {
      return getCatalogueBreadcrumbs(id ?? '');
    },
    enabled: !!id,
  });
};

const postCatalogueCategory = async (
  catalogueCategory: CatalogueCategoryPost
): Promise<CatalogueCategory> => {
  return imsApi
    .post<CatalogueCategory>(`/v1/catalogue-categories`, catalogueCategory)
    .then((response) => response.data);
};

export const usePostCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  CatalogueCategoryPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueCategory: CatalogueCategoryPost) =>
      postCatalogueCategory(catalogueCategory),
    onSuccess: (category) => {
      queryClient.invalidateQueries({
        queryKey: ['CatalogueCategories', category.parent_id ?? 'null'],
      });
    },
  });
};

const postCatalogueCategoryProperty = async (
  catalogueCategory: CatalogueCategory,
  property: CatalogueCategoryPropertyPost
): Promise<CatalogueCategoryProperty> => {
  return imsApi
    .post<CatalogueCategoryProperty>(
      `/v1/catalogue-categories/${catalogueCategory.id}/properties`,
      property
    )
    .then((response) => response.data);
};

export const usePostCatalogueCategoryProperty = (): UseMutationResult<
  CatalogueCategoryProperty,
  AxiosError,
  {
    catalogueCategory: CatalogueCategory;
    property: CatalogueCategoryPropertyPost;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogueCategory, property }) => {
      handleTransferState([
        {
          name: catalogueCategory.name,
          message: `Adding property ${property.name} in ${catalogueCategory.name}`,
          state: 'information',
        },
      ]);
      return postCatalogueCategoryProperty(catalogueCategory, property);
    },
    onSuccess: (data, variables) => {
      const { name } = data;
      queryClient.invalidateQueries({
        queryKey: [
          'CatalogueCategories',
          variables.catalogueCategory.parent_id ?? 'null',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItems', variables.catalogueCategory.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItem'],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items'],
      });
      queryClient.invalidateQueries({
        queryKey: ['Item'],
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
      const response = error.response?.data as APIError;

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

const patchCatalogueCategoryProperty = async (
  catalogueCategory: CatalogueCategory,
  propertyId: string,
  property: CatalogueCategoryPropertyPatch
): Promise<CatalogueCategoryProperty> => {
  return imsApi
    .patch<CatalogueCategoryProperty>(
      `/v1/catalogue-categories/${catalogueCategory.id}/properties/${propertyId}`,
      property
    )
    .then((response) => response.data);
};

export const usePatchCatalogueCategoryProperty = (): UseMutationResult<
  CatalogueCategoryProperty,
  AxiosError,
  {
    catalogueCategory: CatalogueCategory;
    propertyId: string;
    property: CatalogueCategoryPropertyPatch;
  }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ catalogueCategory, propertyId, property }) => {
      handleTransferState([
        {
          name: catalogueCategory.name,
          message: `Editing property ${property.name} in ${catalogueCategory.name}`,
          state: 'information',
        },
      ]);
      return patchCatalogueCategoryProperty(
        catalogueCategory,
        propertyId,
        property
      );
    },
    onSuccess: (data, variables) => {
      const { name } = data;
      queryClient.invalidateQueries({
        queryKey: [
          'CatalogueCategories',
          variables.catalogueCategory.parent_id ?? 'null',
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItems', variables.catalogueCategory.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['CatalogueItem'],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items'],
      });
      queryClient.invalidateQueries({
        queryKey: ['Item'],
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
      const response = error.response?.data as APIError;

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

const patchCatalogueCategory = async (
  id: string,
  catalogueCategory: CatalogueCategoryPatch
): Promise<CatalogueCategory> => {
  return imsApi
    .patch<CatalogueCategory>(
      `/v1/catalogue-categories/${id}`,
      catalogueCategory
    )
    .then((response) => response.data);
};

export const usePatchCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  { id: string; catalogueCategory: CatalogueCategoryPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, catalogueCategory }) =>
      patchCatalogueCategory(id, catalogueCategory),
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

// TODO move back into app.types

export interface MoveToCatalogueCategoryRHF {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
}

export interface CopyToCatalogueCategoryRHF {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
  // Existing known catalogue category names at the destination
  // (for appending to the names to avoid duplication)
  existingCategoryCodes: string[];
}

export const useMoveToCatalogueCategory = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveToCatalogueCategoryRHF
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moveToCatalogueCategory: MoveToCatalogueCategoryRHF) => {
      const transferStates: TransferState[] = [];

      // Ids for invalidation (parentIds must be a string value of 'null' for invalidation)
      const successfulIds: string[] = [];
      const successfulParentIds: string[] = [];

      const promises = moveToCatalogueCategory.selectedCategories.map(
        async (category: CatalogueCategory) => {
          return patchCatalogueCategory(category.id, {
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
              const response = error.response?.data as APIError;

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
  CopyToCatalogueCategoryRHF
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (copyToCatalogueCategory: CopyToCatalogueCategoryRHF) => {
      const transferStates: TransferState[] = [];

      // Ids for invalidation (must be a string value of 'null' if null
      // for invalidation)
      const successfulParentIds: string[] = [];

      const promises = copyToCatalogueCategory.selectedCategories.map(
        async (category: CatalogueCategory) => {
          // Data to post (backend will just ignore the extra here - only id and code)
          // Also use Object.assign to copy the data otherwise will modify in place causing issues
          // in tests
          const categoryPost: CatalogueCategoryPost = Object.assign(
            {},
            category
          ) as CatalogueCategoryPost;

          // Assign new parent
          categoryPost.parent_id =
            copyToCatalogueCategory.targetCategory?.id || null;

          // Avoid duplicates
          categoryPost.name = generateUniqueNameUsingCode(
            categoryPost.name,
            category.code,
            copyToCatalogueCategory.existingCategoryCodes
          );

          return postCatalogueCategory(categoryPost)
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
              const response = error.response?.data as APIError;

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
  catalogueCategoryId: string
): Promise<void> => {
  return imsApi
    .delete(`/v1/catalogue-categories/${catalogueCategoryId}`)
    .then((response) => response.data);
};

export const useDeleteCatalogueCategory = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogueCategoryId: string) =>
      deleteCatalogueCategory(catalogueCategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueCategories'] });
    },
  });
};

const getCatalogueCategory = async (
  id: string | undefined
): Promise<CatalogueCategory> => {
  return imsApi.get(`/v1/catalogue-categories/${id}`, {}).then((response) => {
    return response.data;
  });
};

export const useGetCatalogueCategory = (
  id?: string | null
): UseQueryResult<CatalogueCategory, AxiosError> => {
  return useQuery({
    queryKey: ['CatalogueCategory', id],
    queryFn: () => {
      return getCatalogueCategory(id ?? '');
    },
    enabled: !!id,
  });
};
