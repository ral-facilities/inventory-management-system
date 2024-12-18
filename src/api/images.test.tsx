import { renderHook, waitFor } from '@testing-library/react';
import ImagesJSON from '../mocks/Images.json';
import {
  CREATED_MODIFIED_TIME_VALUES,
  hooksWrapperWithProviders,
} from '../testUtils';
import { APIImage, ObjectFilePatch } from './api.types';
import {
  useDeleteImage,
  useGetImage,
  useGetImages,
  usePatchImage,
} from './images';

describe('images api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetImages', () => {
    it('sends request to fetch image data and returns successful response', async () => {
      const { result } = renderHook(() => useGetImages('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toEqual(20);
    });

    it('sends request to fetch primary image data and returns successful response', async () => {
      const { result } = renderHook(() => useGetImages('1', true), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toEqual(1);
    });

    it('sends request to fetch primary image data and returns successful empty list response', async () => {
      const { result } = renderHook(() => useGetImages('90', true), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toEqual(0);
    });
  });

  describe('useGetImage', () => {
    it('sends request to fetch image data and returns successful response', async () => {
      const { result } = renderHook(() => useGetImage('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        ...ImagesJSON[1],
        url: 'http://localhost:3000/images/stfc-logo-blue-text.png?text=1',
      });
    });
  });

  describe('usePatchImage', () => {
    let mockDataPatch: ObjectFilePatch;
    beforeEach(() => {
      mockDataPatch = {
        file_name: 'edited_image.jpeg',
        title: 'an edited title',
        description: 'an edited description',
      };
    });
    it('sends a patch request to edit an image and returns a successful response', async () => {
      const { result } = renderHook(() => usePatchImage(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate({ id: '1', fileMetadata: mockDataPatch });
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({
        ...ImagesJSON[0],
        ...mockDataPatch,
      });
    });
  });

  describe('useDeleteImage', () => {
    let mockDataView: APIImage;
    beforeEach(() => {
      mockDataView = {
        id: '1',
        file_name: 'Image A',
        entity_id: '2',
        title: '2',
        description: 'a description',
        primary: false,
        thumbnail_base64: 'base64_thumbnail_test',
        ...CREATED_MODIFIED_TIME_VALUES,
      };
    });

    it('posts a request to delete a manufacturer and return a successful response', async () => {
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView.id);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });
  });
});
