import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddCatalogueItem,
  useCatalogueItem,
  useCatalogueItems,
  useDeleteCatalogueItem,
  useEditCatalogueItem,
} from './catalogueItem';
import { catalogueItemData, hooksWrapperWithProviders } from '../setupTests';
import {
  AddCatalogueItem,
  CatalogueItem,
  EditCatalogueItem,
} from '../app.types';

describe('catalogue items api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddCatalogueCategory', () => {
    let mockDataAdd: AddCatalogueItem;
    beforeEach(() => {
      mockDataAdd = {
        name: 'test',
        description: '',
        catalogue_category_id: '1',
        properties: [
          { name: 'test_bool', value: false },
          { name: 'test_string', value: 'string' },
          { name: 'test_number', value: 2 },
        ],
      };
    });
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useAddCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAdd);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        catalogue_category_id: '1',
        description: '',
        id: '1',
        name: 'test',
        properties: [
          { name: 'test_bool', value: false },
          { name: 'test_string', value: 'string' },
          { name: 'test_number', value: 2 },
        ],
      });
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useCatalogueItems', () => {
    it('sends request to fetch catalogue items data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueItems('5'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(catalogueItemData('5'));
    });

    it.todo(
      'sends axios request to fetch catalogue items and throws an appropriate error on failure'
    );
  });

  describe('useCatalogueItem', () => {
    it('sends request to fetch catalogue items data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueItem('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        catalogue_category_id: '4',
        description: 'High-resolution cameras for beam characterization. 1',
        id: '1',
        name: 'Cameras 1',
        properties: [
          { name: 'Resolution', unit: 'megapixels', value: 12 },
          { name: 'Frame Rate', unit: 'fps', value: 30 },
          { name: 'Sensor Type', unit: '', value: 'CMOS' },
          { name: 'Broken', unit: '', value: true },
          { name: 'Older than five years', unit: '', value: false },
        ],
      });
    });

    it.todo(
      'sends axios request to fetch catalogue item and throws an appropriate error on failure'
    );
  });

  describe('useDeleteCatalogueItem', () => {
    let mockDataView: CatalogueItem;
    beforeEach(() => {
      mockDataView = {
        name: 'test',
        id: '1',
        catalogue_category_id: '3',
        description: '',
        properties: [],
      };
    });
    it('posts a request to delete a catalogue Item and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });

    it.todo(
      'sends axios request to delete a catalogue Item and throws an appropriate error on failure'
    );
  });

  describe('useEditCatalogueItem', () => {
    let mockDataEdit: EditCatalogueItem;
    beforeEach(() => {
      mockDataEdit = {
        name: 'test',
        id: '4',
      };
    });
    it('posts a request to edit a catalogue item and returns successful response', async () => {
      const { result } = renderHook(() => useEditCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataEdit);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        catalogue_category_id: '4',
        name: 'test',
        description: 'High-resolution cameras for beam characterization. 4',
        properties: [
          { name: 'Resolution', value: 24, unit: 'megapixels' },
          { name: 'Frame Rate', value: 240, unit: 'fps' },
          { name: 'Sensor Type', value: 'CCD', unit: '' },
          { name: 'Sensor brand', value: 'Nikon', unit: '' },
          { name: 'Broken', value: false, unit: '' },
          { name: 'Older than five years', value: true, unit: '' },
        ],
        id: '4',
      });
    });

    it.todo(
      'sends axios request to edit a catalogue item and throws an appropriate error on failure'
    );
  });
});
