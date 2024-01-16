import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddCatalogueItem,
  useCatalogueItem,
  useCatalogueItems,
  useCopyToCatalogueItem,
  useDeleteCatalogueItem,
  useEditCatalogueItem,
  useMoveToCatalogueItem,
} from './catalogueItem';
import { catalogueItemData, hooksWrapperWithProviders } from '../setupTests';
import {
  AddCatalogueItem,
  CatalogueItem,
  EditCatalogueItem,
  TransferToCatalogueItem,
} from '../app.types';

describe('catalogue items api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddCatalogueItem', () => {
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
    it('posts a request to add a catalogue item and returns successful response', async () => {
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
        cost_gbp: 500,
        cost_to_rework_gbp: null,
        days_to_replace: 7,
        days_to_rework: null,
        description: 'High-resolution cameras for beam characterization. 1',
        drawing_link: null,
        drawing_number: null,
        id: '1',
        is_obsolete: false,
        manufacturer_id: '1',
        item_model_number: null,
        name: 'Cameras 1',
        obsolete_reason: null,
        obsolete_replacement_catalogue_item_id: null,
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
        id: '90',
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
        id: '90',
      });
    });

    it.todo(
      'sends axios request to edit a catalogue item and throws an appropriate error on failure'
    );
  });

  describe('useMoveToCatalogueItem', () => {
    let props: TransferToCatalogueItem;

    beforeEach(() => {
      props = {
        selectedCatalogueItems: [
          {
            catalogue_category_id: '657305a01e468454e97b6389',
            manufacturer_id: '1',
            name: 'test',
            description: null,
            cost_gbp: 20,
            cost_to_rework_gbp: null,
            days_to_replace: 2,
            days_to_rework: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                name: 'center wavelength',
                value: 10,
                unit: 'nm',
              },
            ],
            id: '657305e51e468454e97b638b',
          },
          {
            catalogue_category_id: '657305a01e468454e97b6389',
            manufacturer_id: '1',
            name: 'test_copy1',
            description: null,
            cost_gbp: 20,
            cost_to_rework_gbp: null,
            days_to_replace: 2,
            days_to_rework: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                name: 'center wavelength',
                value: 10,
                unit: 'nm',
              },
            ],
            id: '657324df1e468454e97b638e',
          },
        ],
        targetCatalogueCategory: {
          name: 'RF Lenses',
          is_leaf: true,
          parent_id: '655ca56c1c251a2a828ca906',
          catalogue_item_properties: [
            {
              name: 'center wavelength',
              type: 'number',
              unit: 'nm',
              mandatory: true,
            },
          ],
          id: '657305bc1e468454e97b638a',
          code: 'rf-lenses',
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('sends requests to move multiple catalogue items and returns successful response', async () => {
      const { result } = renderHook(() => useMoveToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        {
          message: 'Successfully moved to RF Lenses',
          name: 'test',
          state: 'success',
        },
        {
          message: 'Successfully moved to RF Lenses',
          name: 'test_copy1',
          state: 'success',
        },
      ]);
    });

    it('sends requests to move a single catalogue item and returns unsuccessful response as the catalogue_category_id has not changed', async () => {
      props.targetCatalogueCategory = {
        ...props.targetCatalogueCategory,
        id: 'Error 500',
      };

      const { result } = renderHook(() => useMoveToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        { message: undefined, name: 'test', state: 'error' },
        { message: undefined, name: 'test_copy1', state: 'error' },
      ]);
    });
  });

  describe('useCopyToCatalogueItem', () => {
    let props: TransferToCatalogueItem;

    beforeEach(() => {
      props = {
        selectedCatalogueItems: [
          {
            catalogue_category_id: '657305a01e468454e97b6389',
            manufacturer: {
              name: 'test',
              url: 'https://exampple.com/',
              address: 'test',
            },
            name: 'test',
            description: null,
            cost_gbp: 20,
            cost_to_rework_gbp: null,
            days_to_replace: 2,
            days_to_rework: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                name: 'center wavelength',
                value: 10,
                unit: 'nm',
              },
            ],
            id: '657305e51e468454e97b638b',
          },
          {
            catalogue_category_id: '657305a01e468454e97b6389',
            manufacturer: {
              name: 'test',
              url: 'https://exampple.com/',
              address: 'test',
            },
            name: 'test_copy1',
            description: null,
            cost_gbp: 20,
            cost_to_rework_gbp: null,
            days_to_replace: 2,
            days_to_rework: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                name: 'center wavelength',
                value: 10,
                unit: 'nm',
              },
            ],
            id: '657324df1e468454e97b638e',
          },
        ],
        targetCatalogueCategory: {
          name: 'RF Lenses',
          is_leaf: true,
          parent_id: '655ca56c1c251a2a828ca906',
          catalogue_item_properties: [
            {
              name: 'center wavelength',
              type: 'number',
              unit: 'nm',
              mandatory: true,
            },
          ],
          id: '657305bc1e468454e97b638a',
          code: 'rf-lenses',
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('sends requests to copy multiple catalogue items and returns successful response', async () => {
      const { result } = renderHook(() => useCopyToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        {
          message: 'Successfully copied to RF Lenses',
          name: 'test',
          state: 'success',
        },
        {
          message: 'Successfully copied to RF Lenses',
          name: 'test_copy1',
          state: 'success',
        },
      ]);
    });

    it('sends requests to copy a mutiple catalogue item and returns unsuccessful response as the catalogue_category_id has not changed', async () => {
      props.targetCatalogueCategory = {
        ...props.targetCatalogueCategory,
        id: 'Error 500',
      };

      const { result } = renderHook(() => useCopyToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        { message: undefined, name: 'test', state: 'error' },
        { message: undefined, name: 'test_copy1', state: 'error' },
      ]);
    });
  });
});
