import { renderHook, waitFor } from '@testing-library/react';
import ImagesJSON from '../mocks/Images.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useGetImage, useGetImages, useGetImagesIds } from './images';

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

  describe('useGetImagesIds', () => {
    it('sends request to fetch image data and returns successful response', async () => {
      const { result } = renderHook(() => useGetImagesIds(['0', '1']), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        result.current.forEach((query) => expect(query.isSuccess).toBeTruthy());
      });

      expect(result.current[0].data).toEqual({
        ...ImagesJSON.filter((image) => image.id === '1')[0],
        id: '0',
        url: 'http://localhost:3000/logo192.png?text=0',
      });
      expect(result.current[1].data).toEqual({
        ...ImagesJSON.filter((image) => image.id === '1')[1],
        url: 'http://localhost:3000/images/stfc-logo-blue-text.png?text=1',
      });
    });
  });
});
