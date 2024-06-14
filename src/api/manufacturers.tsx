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
import {
  ManufacturerPatchSchema,
  ManufacturerPostSchema,
  ManufacturerSchema,
} from './api.types';

const getAllManufacturers = async (): Promise<ManufacturerSchema[]> => {
  return imsApi.get(`/v1/manufacturers`, {}).then((response) => response.data);
};

export const useManufacturers = (): UseQueryResult<
  ManufacturerSchema[],
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
  manufacturer: ManufacturerPostSchema
): Promise<ManufacturerSchema> => {
  return imsApi
    .post<ManufacturerSchema>(`/v1/manufacturers`, manufacturer)
    .then((response) => response.data);
};

export const useAddManufacturer = (): UseMutationResult<
  ManufacturerSchema,
  AxiosError,
  ManufacturerPostSchema
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: ManufacturerPostSchema) =>
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

const fetchManufacturer = async (id: string): Promise<ManufacturerSchema> => {
  return imsApi
    .get(`/v1/manufacturers/${id}`)
    .then((response) => response.data);
};

export const useManufacturer = (
  id?: string | null
): UseQueryResult<ManufacturerSchema, AxiosError> => {
  return useQuery({
    queryKey: ['Manufacturer', id],
    queryFn: () => fetchManufacturer(id ?? ''),
    enabled: !!id,
  });
};

export const useManufacturerIds = (
  ids: string[]
): UseQueryResult<ManufacturerSchema>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['Manufacturer', id],
      queryFn: () => fetchManufacturer(id),
    })),
  });
};

const editManufacturer = async (
  manufacturer: ManufacturerPatchSchema
): Promise<ManufacturerSchema> => {
  const { id, ...updatedManufacturer } = manufacturer;
  return imsApi
    .patch<ManufacturerSchema>(`/v1/manufacturers/${id}`, updatedManufacturer)
    .then((response) => response.data);
};

export const useEditManufacturer = (): UseMutationResult<
  ManufacturerSchema,
  AxiosError,
  ManufacturerPatchSchema
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: ManufacturerPatchSchema) =>
      editManufacturer(manufacturer),
    onSuccess: (updatedManufacturer: ManufacturerSchema) => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      queryClient.invalidateQueries({
        queryKey: ['Manufacturer', updatedManufacturer.id],
      });
    },
  });
};
