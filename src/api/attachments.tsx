import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { AxiosError } from 'axios';
import { storageApi } from './api';
import {
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

export const getAttachment = async (id: string): Promise<AttachmentPostMetadataResponse> => {
  return storageApi.get(`/attachments/${id}`).then((response) => {
    return response.data;
  });
};

export const useGetAttachment = (
  id: string
): UseQueryResult<AttachmentPostMetadataResponse, AxiosError> => {
  return useQuery({
    queryKey: ['Attachment', id],
    queryFn: () => getAttachment(id),
  });
};

const getAttachments = async (
  entityId: string
): Promise<AttachmentPostMetadata[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity_id', entityId);

  return storageApi
    .get(`/attachments`, {
      params: queryParams,
    })
    .then((response) => response.data);
};

export const useGetAttachments = (
  entityId?: string
): UseQueryResult<AttachmentPostMetadata[], AxiosError> => {
  return useQuery({
    queryKey: ['Attachments', entityId],
    queryFn: () => getAttachments(entityId ?? ''),
    enabled: !!entityId,
  });
};
