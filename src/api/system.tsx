import axios, { AxiosError } from 'axios';
import { settings } from '../settings';
import { BreadcrumbsInfo, System } from '../app.types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const fetchSystems = async (
  path?: string,
  parentPath?: string
): Promise<System[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  if (path) queryParams.append('path', path);
  if (parentPath) queryParams.append('parent_path', parentPath);

  return axios
    .get(`${apiUrl}/v1/systems/`, { params: queryParams })
    .then((response) => {
      return response.data;
    });
};

export const useSystems = (
  path?: string,
  parent_path?: string
): UseQueryResult<System[], AxiosError> => {
  return useQuery<System[], AxiosError>(
    ['Systems', path, parent_path],
    (params) => {
      return fetchSystems(path, parent_path);
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
  id: string
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery<BreadcrumbsInfo, AxiosError>(
    ['SystemBreadcrumbs', id],
    (params) => {
      return fetchSystemsBreadcrumbs(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== '',
    }
  );
};
