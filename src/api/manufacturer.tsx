import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { settings } from '../settings';

import {
  AddManufacturer,
  AddManufacturerResponse,
  ViewManufacturerResponse,
} from '../app.types';

const getAllManufacturers = async (): Promise<ViewManufacturerResponse[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/manufacturers`, {})
    .then((response) => response.data);
};

export const useManufacturers = (): UseQueryResult<
  ViewManufacturerResponse[],
  AxiosError
> => {
  return useQuery<ViewManufacturerResponse[], AxiosError>(
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

const addManufacturer = async (
  manufacturer: AddManufacturer
): Promise<AddManufacturerResponse> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .post<AddManufacturerResponse>(`${apiUrl}/v1/manufacturers`, manufacturer)
    .then((response) => response.data);
};

export const useAddManufacturer = (): UseMutationResult<
  AddManufacturerResponse,
  AxiosError,
  AddManufacturer
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (manufacturer: AddManufacturer) => addManufacturer(manufacturer),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      },
    }
  );
};

const deleteManufacturer = async (
  session: ViewManufacturerResponse
): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/manufacturers/${session.id}`, {})
    .then((response) => response.data);
};

export const useDeleteManufacturer = (): UseMutationResult<
  void,
  AxiosError,
  ViewManufacturerResponse
> => {
  return useMutation(
    (session: ViewManufacturerResponse) => deleteManufacturer(session),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
