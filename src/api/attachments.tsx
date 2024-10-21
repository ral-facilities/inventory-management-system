import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { storageApi } from './api';
import {
  AttachmentMetadataPost,
  AttachmentMetadataPostResponse,
} from './api.types';

const postAttachmentMetadata = async (
  attachmentMetadata: AttachmentMetadataPost
): Promise<AttachmentMetadataPostResponse> => {
  return storageApi
    .post<AttachmentMetadataPostResponse>(`/attachments`, attachmentMetadata)
    .then((response) => response.data);
};

export const usePostAttachmentMetadata = (): UseMutationResult<
  AttachmentMetadataPostResponse,
  AxiosError,
  AttachmentMetadataPost
> => {
  return useMutation({
    mutationFn: (attachmentMetadata: AttachmentMetadataPost) =>
      postAttachmentMetadata(attachmentMetadata),
  });
};
