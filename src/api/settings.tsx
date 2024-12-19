import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { imsApi } from './api';
import { SparesDefinition, SparesDefinitionPut } from './api.types';

const getSparesDefinition = async (): Promise<SparesDefinition> => {
  return imsApi.get('/v1/settings/spares_definition').then((response) => {
    return response.data;
  });
};

export const useGetSparesDefinition = (): UseQueryResult<
  SparesDefinition,
  AxiosError
> => {
  return useQuery({
    queryKey: ['SparesDefinition'],
    queryFn: () => {
      return getSparesDefinition();
    },
  });
};

const putSparesDefinition = async (
  sparesDefinition: SparesDefinitionPut
): Promise<SparesDefinition> => {
  return imsApi
    .put<SparesDefinition>(`/v1/settings/spares_definition`, sparesDefinition)
    .then((response) => response.data);
};

export const usePutSparesDefinition = (): UseMutationResult<
  SparesDefinition,
  AxiosError,
  SparesDefinitionPut
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sparesDefinition: SparesDefinitionPut) =>
      putSparesDefinition(sparesDefinition),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['SparesDefinition'],
      });
    },
  });
};
