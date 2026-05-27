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

const postCatalogueItemsTemplateValidation = async (
  catalogueCategoryId: string,
  spreadsheetFile: File
): Promise<AxiosResponse<Blob>> => {
  const formData = new FormData();

  formData.append('catalogue_category_id', catalogueCategoryId);
  formData.append('spreadsheet_file', spreadsheetFile);

  return ingestApi.post('/spreadsheets/catalogue-items/validate', formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const usePostCatalogueItemsTemplateValidation = (): UseMutationResult<
  AxiosResponse<Blob>,
  AxiosError,
  { catalogueCategoryId: string; spreadsheetFile: File }
> => {
  return useMutation({
    mutationFn: ({
      catalogueCategoryId,
      spreadsheetFile,
    }: {
      catalogueCategoryId: string;
      spreadsheetFile: File;
    }) =>
      postCatalogueItemsTemplateValidation(
        catalogueCategoryId,
        spreadsheetFile
      ),
  });
};
