import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { historyApi } from './api';
import { HistoryEntry } from './api.types';
import { AxiosError } from 'axios';
// import HistoryJSON from '../mocks/History.json';

const getHistoryEntries = async (
  collection: string,
  element_id: string | null
  // The other filterable params will be added in at a later date
  // operation_type: string,
  // order_descending: boolean
): Promise<HistoryEntry[]> => {
  const queryParams = new URLSearchParams();
  if (element_id) {
    queryParams.append('element_id', element_id);
  }

  return historyApi
    .get(`/v1/history-entries/${collection}`, {
      params: queryParams,
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    });
};

export const getHistoryEntriesQuery = (
  collection: string,
  element_id: string,
  retry?: boolean
) =>
  queryOptions<HistoryEntry[], AxiosError>({
    queryKey: ['history_entries', collection, element_id],
    queryFn: () => getHistoryEntries(collection, element_id),
    retry: retry ? false : undefined,
  });

export const useGetHistoryEntries = (
  collection: string,
  element_id: string | null
): UseQueryResult<HistoryEntry[], AxiosError> => {
  console.log('IN QUERY');
  return useQuery({
    queryKey: ['history_entries', collection, element_id],
    queryFn: () => getHistoryEntries(collection, element_id),
  });
};
