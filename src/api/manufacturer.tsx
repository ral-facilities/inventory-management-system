import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { settings } from '../settings';

import { Manufacturer } from '../app.types';

const getAllManufacturers = async (): Promise<Manufacturer[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/manufacturer`, {})
    .then((response) => response.data);
};

export const useManufacturers = (): UseQueryResult<
  Manufacturer[],
  AxiosError
> => {
  return useQuery<Manufacturer[], AxiosError>(
    ['Manufacturers'],
    (params) => {
      return getAllManufacturers();
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
