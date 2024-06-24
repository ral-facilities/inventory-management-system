import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { imsApi } from './api';
import { Unit, UnitPost } from './api.types';

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

const addUnit = async (unit: UnitPost): Promise<Unit> => {
  return imsApi.post<Unit>(`/v1/units`, unit).then((response) => response.data);
};

export const useAddUnit = (): UseMutationResult<Unit, AxiosError, UnitPost> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unit: UnitPost) => addUnit(unit),
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
