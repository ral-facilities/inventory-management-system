import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { storageApi } from './api';
import {
  AttachmentsPostMetadata,
  AttachmentsPostMetadataResponse,
} from './api.types';

const postAttachmentMetadata = async (
  attachmentMetadata: AttachmentsPostMetadata
): Promise<AttachmentsPostMetadataResponse> => {
  return storageApi
    .post<AttachmentsPostMetadataResponse>(`/attachments`, attachmentMetadata)
    .then((response) => response.data);
};

export const usePostAttachmentMetadata = (): UseMutationResult<
  AttachmentsPostMetadataResponse,
  AxiosError,
  AttachmentsPostMetadata
> => {
  return useMutation({
    mutationFn: (attachmentMetadata: AttachmentsPostMetadata) =>
      postAttachmentMetadata(attachmentMetadata),
  });
};
