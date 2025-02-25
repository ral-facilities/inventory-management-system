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
  ObjectFilePatch,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentMetadata: AttachmentPostMetadata) =>
      postAttachmentMetadata(attachmentMetadata),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['Attachments'],
      });
    },
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
): Promise<AttachmentPostMetadataResponse[]> => {
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
): UseQueryResult<AttachmentPostMetadataResponse[], AxiosError> => {
  return useQuery({
    queryKey: ['Attachments', entityId],
    queryFn: () => getAttachments(entityId ?? ''),
    enabled: !!entityId,
  });
};

const patchAttachment = async (
  id: string,
  fileMetadata: ObjectFilePatch
): Promise<AttachmentPostMetadataResponse> => {
  return storageApi
    .patch<AttachmentPostMetadataResponse>(`/attachments/${id}`, fileMetadata)
    .then((response) => response.data);
};

export const usePatchAttachment = (): UseMutationResult<
  AttachmentPostMetadataResponse,
  AxiosError,
  { id: string; fileMetadata: ObjectFilePatch }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileMetadata }) => patchAttachment(id, fileMetadata),
    onSuccess: (updatedAttachment: AttachmentPostMetadataResponse) => {
      queryClient.invalidateQueries({ queryKey: ['Attachments'] });
      queryClient.invalidateQueries({
        queryKey: ['Attachment', updatedAttachment.id],
      });
    },
  });
};
