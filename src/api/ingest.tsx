import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { ingestApi } from './api';

const postCatalogueItemsTemplate = async (
  catalogueCategoryId: string
): Promise<AxiosResponse<Blob>> => {
  return ingestApi.post(
    '/spreadsheets/catalogue-items/template',
    { catalogue_category_id: catalogueCategoryId },
    {
      responseType: 'blob',
    }
  );
};

export const usePostCatalogueItemsTemplate = (): UseMutationResult<
  AxiosResponse<Blob>,
  AxiosError,
  { catalogueCategoryId: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ catalogueCategoryId }: { catalogueCategoryId: string }) =>
      postCatalogueItemsTemplate(catalogueCategoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
    },
  });
};
