import {
  queryOptions,
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

const getManufacturers = async (): Promise<Manufacturer[]> => {
  return imsApi.get(`/v1/manufacturers`, {}).then((response) => response.data);
};

export const useGetManufacturers = (): UseQueryResult<
  Manufacturer[],
  AxiosError
> => {
  return useQuery({
    queryKey: ['Manufacturers'],
    queryFn: () => {
      return getManufacturers();
    },
  });
};

const postManufacturer = async (
  manufacturer: ManufacturerPost
): Promise<Manufacturer> => {
  return imsApi
    .post<Manufacturer>(`/v1/manufacturers`, manufacturer)
    .then((response) => response.data);
};

export const usePostManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  ManufacturerPost
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manufacturer: ManufacturerPost) =>
      postManufacturer(manufacturer),
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

const getManufacturer = async (id: string): Promise<Manufacturer> => {
  return imsApi
    .get(`/v1/manufacturers/${id}`)
    .then((response) => response.data);
};
export const getManufacturerQuery = (id?: string | null, retry?: boolean) =>
  queryOptions<Manufacturer, AxiosError>({
    queryKey: ['Manufacturer', id],
    queryFn: () => getManufacturer(id ?? ''),
    enabled: !!id,
    retry: retry ? false : undefined,
  });

export const useGetManufacturer = (
  id?: string | null
): UseQueryResult<Manufacturer, AxiosError> => {
  return useQuery(getManufacturerQuery(id));
};

export const useGetManufacturerIds = (
  ids: string[]
): UseQueryResult<Manufacturer>[] => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['Manufacturer', id],
      queryFn: () => getManufacturer(id),
    })),
  });
};

const patchManufacturer = async (
  id: string,
  manufacturer: ManufacturerPatch
): Promise<Manufacturer> => {
  return imsApi
    .patch<Manufacturer>(`/v1/manufacturers/${id}`, manufacturer)
    .then((response) => response.data);
};

export const usePatchManufacturer = (): UseMutationResult<
  Manufacturer,
  AxiosError,
  { id: string; manufacturer: ManufacturerPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, manufacturer }) => patchManufacturer(id, manufacturer),
    onSuccess: (updatedManufacturer: Manufacturer) => {
      queryClient.invalidateQueries({ queryKey: ['Manufacturers'] });
      queryClient.invalidateQueries({
        queryKey: ['Manufacturer', updatedManufacturer.id],
      });
    },
  });
};
