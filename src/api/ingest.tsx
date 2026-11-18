import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { ingestApi } from './api';

const postSpreadsheetTemplate = async (
  endpointSegment: string,
  parent?: { parentIdField: string; parentId: string }
  // Blob response required because direct browser requests auto-download based on headers, but programmatic requests
  // (fetch/axios) return data to JavaScript, so the client must manually trigger the download
): Promise<AxiosResponse<Blob>> => {
  return ingestApi.post(
    `/spreadsheets/${endpointSegment}/template`,
    parent ? { [parent.parentIdField]: parent.parentId } : undefined,
    {
      responseType: 'blob',
    }
  );
};

export const usePostSpreadsheetTemplate = (
  endpointSegment: string,
  parent?: { parentIdField: string; parentId: string }
): UseMutationResult<AxiosResponse<Blob>, AxiosError> => {
  return useMutation({
    mutationFn: () => postSpreadsheetTemplate(endpointSegment, parent),
  });
};
