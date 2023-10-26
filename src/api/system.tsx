import axios, { AxiosError } from 'axios';
import { settings } from '../settings';
import { BreadcrumbsInfo, System } from '../app.types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const fetchSystems = async (parent_id?: string): Promise<System[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  if (parent_id) queryParams.append('parent_id', parent_id);

  return axios
    .get(`${apiUrl}/v1/systems`, { params: queryParams })
    .then((response) => {
      return response.data;
    });
};

export const useSystems = (
  parent_id?: string
): UseQueryResult<System[], AxiosError> => {
  return useQuery<System[], AxiosError>(
    ['Systems', parent_id],
    (params) => {
      return fetchSystems(parent_id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchSystemsBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/systems/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useSystemsBreadcrumbs = (
  id: string | null
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery<BreadcrumbsInfo, AxiosError>(
    ['SystemBreadcrumbs', id],
    (params) => {
      return fetchSystemsBreadcrumbs(id ?? '');
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== null,
    }
  );
};
