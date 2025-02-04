import { renderHook, waitFor } from '@testing-library/react';
import ImagesJSON from '../mocks/Images.json';
import {
  CREATED_MODIFIED_TIME_VALUES,
  hooksWrapperWithProviders,
} from '../testUtils';
import { APIImage } from './api.types';
import { useDeleteImage, useGetImage, useGetImages } from './images';

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
        view_url: 'http://localhost:3000/images/stfc-logo-blue-text.png?text=1',
        download_url:
          'http://localhost:3000/images/stfc-logo-blue-text.png?text=1',
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

    it('posts a request to delete an image and return a successful response', async () => {
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
