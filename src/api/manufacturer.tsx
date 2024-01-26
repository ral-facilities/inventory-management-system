import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { settings } from '../settings';

import { AddManufacturer, Manufacturer, EditManufacturer } from '../app.types';

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
  return useQuery({
    queryKey: ['Manufacturers'],
    queryFn: (params) => {
      return getAllManufacturers();
    },
  });
};

const addManufacturer = async (
  manufacturer: AddManufacturer
): Promise<Manufacturer> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .post<Manufacturer>(`${apiUrl}/v1/manufacturers`, manufacturer)
    .then((response) => response.data);
};

export const useAddManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  AddManufacturer
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: AddManufacturer) =>
      addManufacturer(manufacturer),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
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
  return useMutation({
    mutationFn: (session: Manufacturer) => deleteManufacturer(session),
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
  return useQuery({
    queryKey: ['Manufacturer', id],

    queryFn: (params) => {
      return fetchManufacturer(id);
    },
    enabled: id !== undefined,
  });
};

export const useManufacturerIds = (
  ids: string[]
): UseQueryResult<Manufacturer>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['Manufacturer', id],
      queryFn: () => fetchManufacturer(id),
    })),
  });
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
  return useMutation({
    mutationFn: (manufacturer: EditManufacturer) =>
      editManufacturer(manufacturer),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: (manufacturerReturned: Manufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      queryClient.invalidateQueries({
        queryKey: ['Manufacturer', manufacturerReturned.id],
      });
    },
  });
};
