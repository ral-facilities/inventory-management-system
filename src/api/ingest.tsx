import { queryOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { ingestApi } from './api';

export const getTemplate = async (
  collection: string,
  id: string
): Promise<AxiosResponse<Blob>> => {
  return ingestApi.get(`/spreadsheets/${collection}/${id}/template`, {
    responseType: 'blob',
  });
};

export const getTemplateQuery = (
  collection: string,
  id: string,
  retry?: boolean
) =>
  queryOptions<AxiosResponse<Blob>, AxiosError>({
    queryKey: ['Ingest', collection, id],
    queryFn: () => getTemplate(collection, id),
    retry: retry ? false : undefined,
  });
