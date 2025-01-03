import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../testUtils';
import { AttachmentPostMetadata } from './api.types';
import { usePostAttachmentMetadata } from './attachments';

describe('attachments api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePostAttachmentMetadata', () => {
    let mockDataPost: AttachmentPostMetadata;
    beforeEach(() => {
      mockDataPost = {
        file_name: 'test.doc',
        entity_id: '1',
        title: 'test',
        description: 'test',
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
});
