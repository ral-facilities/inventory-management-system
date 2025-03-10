import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { storageApi } from './api';
import {
  AttachmentMetadata,
  AttachmentPostMetadata,
  AttachmentPostMetadataResponse,
} from './api.types';

const postAttachmentMetadata = async (
  attachmentMetadata: AttachmentPostMetadata
): Promise<AttachmentPostMetadataResponse> => {
  return storageApi
    .post<AttachmentPostMetadataResponse>(`/attachments`, attachmentMetadata)
    .then((response) => response.data);
};

export const usePostAttachmentMetadata = (): UseMutationResult<
  AttachmentPostMetadataResponse,
  AxiosError,
  AttachmentPostMetadata
> => {
  return useMutation({
    mutationFn: (attachmentMetadata: AttachmentPostMetadata) =>
      postAttachmentMetadata(attachmentMetadata),
  });
};

const getAttachments = async (
  entityId: string
): Promise<AttachmentMetadata[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity_id', entityId);

  return storageApi
    .get(`/attachments`, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useGetAttachments = (
  entityId: string
): UseQueryResult<AttachmentMetadata[], AxiosError> => {
  return useQuery({
    queryKey: ['Attachments', entityId],
    queryFn: () => getAttachments(entityId),
  });
};
