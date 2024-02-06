import axios, { AxiosError } from 'axios';
import { Unit } from '../app.types';
import { settings } from '../settings';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const fetchUnits = async (): Promise<Unit[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios.get(`${apiUrl}/v1/units`).then((response) => {
    return response.data;
  });
};

export const useUnits = (): UseQueryResult<Unit[], AxiosError> => {
  return useQuery({
    queryKey: ['Units'],
    queryFn: (params) => {
      return fetchUnits();
    },
  });
};
