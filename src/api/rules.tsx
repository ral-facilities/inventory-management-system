import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { imsApi } from './api';
import type { Rule } from './api.types';

const getRules = async (
  src_system_type_id?: string,
  dst_system_type_id?: string
): Promise<Rule[]> => {
  const queryParams = new URLSearchParams();

  if (src_system_type_id)
    queryParams.append('src_system_type_id', src_system_type_id);
  if (dst_system_type_id)
    queryParams.append('dst_system_type_id', dst_system_type_id);

  return imsApi.get(`/v1/rules`, { params: queryParams }).then((response) => {
    return response.data;
  });
};

export const useGetRules = (
  src_system_type_id?: string,
  dst_system_type_id?: string
): UseQueryResult<Rule[], AxiosError> => {
  return useQuery({
    queryKey: ['rules', src_system_type_id, dst_system_type_id],
    queryFn: () => getRules(src_system_type_id, dst_system_type_id),
  });
};
