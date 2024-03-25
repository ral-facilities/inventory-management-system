import { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { AddManufacturer, Manufacturer, EditManufacturer } from '../app.types';
import { imsApi } from './api';

const getAllManufacturers = async (): Promise<Manufacturer[]> => {
  return imsApi.get(`/v1/manufacturers`, {}).then((response) => response.data);
};

export const useManufacturers = (): UseQueryResult<
  Manufacturer[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['Manufacturers'],
    queryFn: () => {
      return getAllManufacturers();
    },
  });
};

const addManufacturer = async (
  manufacturer: AddManufacturer
): Promise<Manufacturer> => {
  return imsApi
    .post<Manufacturer>(`/v1/manufacturers`, manufacturer)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
};

const deleteManufacturer = async (session: Manufacturer): Promise<void> => {
  return imsApi
    .delete(`/v1/manufacturers/${session.id}`, {})
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
};

const fetchManufacturer = async (id: string): Promise<Manufacturer> => {
  return imsApi.get(`/v1/manufacturers/${id}`).then((response) => {
    return response.data;
  });
};

export const useManufacturer = (
  id?: string | null
): UseQueryResult<Manufacturer, AxiosError> => {
  return useQuery({
    queryKey: ['Manufacturer', id],
    queryFn: () => {
      return fetchManufacturer(id ?? '');
    },
    enabled: !!id,
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
  const { id, ...updatedManufacturer } = manufacturer;
  return imsApi
    .patch<Manufacturer>(`/v1/manufacturers/${id}`, updatedManufacturer)
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
    onSuccess: (manufacturerReturned: Manufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      queryClient.invalidateQueries({
        queryKey: ['Manufacturer', manufacturerReturned.id],
      });
    },
  });
};
