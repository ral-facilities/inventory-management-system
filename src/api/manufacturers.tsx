import {
  useMutation,
  UseMutationResult,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { imsApi } from './api';
import { Manufacturer, ManufacturerPatch, ManufacturerPost } from './api.types';

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
  manufacturer: ManufacturerPost
): Promise<Manufacturer> => {
  return imsApi
    .post<Manufacturer>(`/v1/manufacturers`, manufacturer)
    .then((response) => response.data);
};

export const useAddManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  ManufacturerPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: ManufacturerPost) =>
      addManufacturer(manufacturer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
};

const deleteManufacturer = async (manufacturerID: string): Promise<void> => {
  return imsApi
    .delete(`/v1/manufacturers/${manufacturerID}`, {})
    .then((response) => response.data);
};

export const useDeleteManufacturer = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturerID: string) => deleteManufacturer(manufacturerID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
    },
  });
};

const fetchManufacturer = async (id: string): Promise<Manufacturer> => {
  return imsApi
    .get(`/v1/manufacturers/${id}`)
    .then((response) => response.data);
};

export const useManufacturer = (
  id?: string | null
): UseQueryResult<Manufacturer, AxiosError> => {
  return useQuery({
    queryKey: ['Manufacturer', id],
    queryFn: () => fetchManufacturer(id ?? ''),
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
  manufacturer: ManufacturerPatch
): Promise<Manufacturer> => {
  const { id, ...updatedManufacturer } = manufacturer;
  return imsApi
    .patch<Manufacturer>(`/v1/manufacturers/${id}`, updatedManufacturer)
    .then((response) => response.data);
};

export const useEditManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  ManufacturerPatch
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: ManufacturerPatch) =>
      editManufacturer(manufacturer),
    onSuccess: (updatedManufacturer: Manufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      queryClient.invalidateQueries({
        queryKey: ['Manufacturer', updatedManufacturer.id],
      });
    },
  });
};
