import {
  queryOptions,
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
  AttachmentMetadataWithURL,
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

export const getAttachment = async (id: string): Promise<AttachmentMetadataWithURL> => {
  return storageApi.get(`/attachments/${id}`).then((response) => {
    return response.data;
  });
};

export const getAttachmentQuery = (id: string, retry?: boolean) =>
  queryOptions<AttachmentMetadataWithURL, AxiosError>({
    queryKey: ['Attachment', id],
    queryFn: () => {
      return getAttachment(id);
    },
    retry: retry ? false : undefined,
  });

export const useGetAttachment = (
  id: string
): UseQueryResult<AttachmentMetadataWithURL, AxiosError> => {
  return useQuery(getAttachmentQuery(id));
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
