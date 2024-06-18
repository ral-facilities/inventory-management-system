import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AddUnit, Unit } from '../app.types';
import { imsApi } from './api';

const fetchUnits = async (): Promise<Unit[]> => {
  return imsApi.get('/v1/units').then((response) => {
    return response.data;
  });
};

export const useUnits = (): UseQueryResult<Unit[], AxiosError> => {
  return useQuery({
    queryKey: ['Units'],
    queryFn: () => {
      return fetchUnits();
    },
  });
};

const addUnit = async (unit: AddUnit): Promise<Unit> => {
  return imsApi.post<Unit>(`/v1/units`, unit).then((response) => response.data);
};

export const useAddUnit = (): UseMutationResult<Unit, AxiosError, AddUnit> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unit: AddUnit) => addUnit(unit),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['Units'],
      });
    },
  });
};

const deleteUnit = async (unitId: string): Promise<void> => {
  return imsApi.delete(`/v1/units/${unitId}`).then((response) => response.data);
};

export const useDeleteUnit = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => deleteUnit(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Units'] });
      queryClient.removeQueries({ queryKey: ['Unit'] });
    },
  });
};
