import { renderHook, waitFor } from '@testing-library/react';
import AttachmentsJSON from '../mocks/Attachments.json'
import { hooksWrapperWithProviders } from '../testUtils';
import { AttachmentMetadataPatch, AttachmentPostMetadata } from './api.types';
import { useGetAttachments, usePatchAttachment, usePostAttachmentMetadata } from './attachments';

describe('attachments api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePostAttachmentMetadata', () => {
    let mockDataPost: AttachmentPostMetadata;
    beforeEach(() => {
      mockDataPost = {
        file_name: 'laser-calibration.txt',
        entity_id: '1',
        title: 'Laser Calibration',
        description: 'Detailed report on the calibration of high-precision lasers used in experiments.',
      };
    });

    it('should post attachment metadata and return a success response', async () => {
      const { result } = renderHook(() => usePostAttachmentMetadata(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataPost);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        id: '1',
        ...mockDataPost,
        upload_info: {
          url: 'http://localhost:3000/object-storage',
          fields: {
            'Content-Type': 'multipart/form-data',
            key: 'attachments/test',
            AWSAccessKeyId: 'root',
            policy: 'policy-test',
            signature: 'signature-test',
          },
        },
        modified_time: '2024-01-02T13:10:10.000+00:00',
        created_time: '2024-01-01T12:00:00.000+00:00',
      });
    });
  });

  describe('useGetAttachments', () => {
    it('sends request to fetch attachment data and returns successful response', async () => {
      const { result } = renderHook(() => useGetAttachments('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toEqual(20);
    });
  });

  describe('usePatchAttachment', () => {
    let mockDataPatch: AttachmentMetadataPatch;

    beforeEach(() => {
      mockDataPatch = {
        file_name: 'edited_attachment.txt',
        title: 'an edited title',
        description: 'an edited description',
      };
    });

    it('sends a patch request to edit an attachment and returns a successful response', async () => {
      const { result } = renderHook(() => usePatchAttachment(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate({ id: '1', fileMetadata: mockDataPatch });
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({
        ...AttachmentsJSON[0],
        ...mockDataPatch,
      });
    });
  });
});
