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
