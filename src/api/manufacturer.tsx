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
  EditManufacturer,
  // ManufacturerDetail,
  Manufacturer,
} from '../app.types';

const getAllManufacturers = async (): Promise<Manufacturer[]> => {
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

const deleteManufacturer = async (session: Manufacturer): Promise<void> => {
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
  Manufacturer
> => {
  const queryClient = useQueryClient();
  return useMutation((session: Manufacturer) => deleteManufacturer(session), {
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
};

const fetchManufacturer = async (
  id: string | undefined
): Promise<Manufacturer> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios.get(`${apiUrl}/v1/manufacturers/${id}`, {}).then((response) => {
    return response.data;
  });
};

export const useManufacturer = (
  id: string | undefined
): UseQueryResult<Manufacturer, AxiosError> => {
  return useQuery<Manufacturer, AxiosError>(
    ['Manufacturer', id],
    (params) => {
      return fetchManufacturer(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== undefined,
    }
  );
};

const editManufacturer = async (
  manufacturer: EditManufacturer
): Promise<Manufacturer> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const { id, ...updatedManufacturer } = manufacturer;
  return axios
    .patch<Manufacturer>(
      `${apiUrl}/v1/manufacturers/${id}`,
      updatedManufacturer
    )
    .then((response) => response.data);
};

export const useEditManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  EditManufacturer
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (manufacturer: EditManufacturer) => editManufacturer(manufacturer),
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
