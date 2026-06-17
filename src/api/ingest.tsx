import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { ingestApi } from './api';

const postCatalogueItemsTemplate = async (
  catalogueCategoryId: string
  // Blob response required because direct browser requests auto-download based on headers, but programmatic requests
  // (fetch/axios) return data to JavaScript, so the client must manually trigger the download
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
  return useMutation({
    mutationFn: ({ catalogueCategoryId }: { catalogueCategoryId: string }) =>
      postCatalogueItemsTemplate(catalogueCategoryId),
  });
};
