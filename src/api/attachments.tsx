import {
  useMutation,
  UseMutationResult,
  useQuery,
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
  queryParams.append('modified_time', '2024-01-02T13:10:10.000+00:00')
  queryParams.append('created_time', '2024-01-01T12:00:00.000+00:00')

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
