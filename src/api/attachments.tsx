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
  AttachmentMetadata,
  AttachmentMetadataPatch,
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

const patchAttachment = async (
  id: string,
  fileMetadata: AttachmentMetadataPatch
): Promise<AttachmentMetadata> => {
  return storageApi
    .patch<AttachmentMetadata>(`/attachments/${id}`, fileMetadata)
    .then((response) => response.data);
};

export const usePatchAttachment = (): UseMutationResult<
  AttachmentMetadata,
  AxiosError,
  { id: string; fileMetadata: AttachmentMetadataPatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileMetadata }) => patchAttachment(id, fileMetadata),
    onSuccess: (updatedAttachment: AttachmentMetadata) => {
      queryClient.invalidateQueries({
        queryKey: ['Attachments', updatedAttachment.entity_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['Attachment', updatedAttachment.id],
      });
    },
  });
};

const deleteAttachent = async (id: string): Promise<void> => {
  return storageApi
    .delete(`/attachments/${id}`, {})
    .then((response) => response.data);
};

export const useDeleteAttachment = (): UseMutationResult<
  void,
  AxiosError,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`Attachments`] });
      queryClient.removeQueries({ queryKey: [`Attachment`] });
    },
  });
};
