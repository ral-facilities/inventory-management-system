import { renderHook, waitFor } from '@testing-library/react';
import { TransferToCatalogueItem } from '../app.types';
import CatalogueItemsJSON from '../mocks/CatalogueItems.json';
import {
  CREATED_MODIFIED_TIME_VALUES,
  catalogueItemData,
  hooksWrapperWithProviders,
} from '../testUtils';
import {
  CatalogueCategory,
  CatalogueCategoryPropertyType,
  CatalogueItem,
  CatalogueItemPatch,
  CatalogueItemPost,
} from './api.types';
import {
  useCopyToCatalogueItem,
  useDeleteCatalogueItem,
  useGetCatalogueItem,
  useGetCatalogueItemIds,
  useGetCatalogueItems,
  useMoveToCatalogueItem,
  usePatchCatalogueItem,
  usePostCatalogueItem,
} from './catalogueItems';

describe('catalogue items api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePostCatalogueItem', () => {
    let mockDataPost: CatalogueItemPost;
    beforeEach(() => {
      mockDataPost = {
        name: 'test',
        description: '',
        catalogue_category_id: '1',
        cost_gbp: 0,
        cost_to_rework_gbp: null,
        days_to_replace: 0,
        days_to_rework: null,
        expected_lifetime_days: null,
        drawing_link: null,
        drawing_number: null,
        notes: null,
        is_obsolete: false,
        item_model_number: null,
        manufacturer_id: '1',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
        properties: [
          { id: '1', value: false },
          { id: '2', value: 'string' },
          { id: '3', value: 2 },
        ],
      };
    });
    it('posts a request to add a catalogue item and returns successful response', async () => {
      const { result } = renderHook(() => usePostCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataPost);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        catalogue_category_id: '1',
        description: '',
        id: '1',
        name: 'test',
        cost_gbp: 0,
        cost_to_rework_gbp: null,
        days_to_replace: 0,
        days_to_rework: null,
        expected_lifetime_days: null,
        drawing_link: null,
        drawing_number: null,
        notes: null,
        is_obsolete: false,
        item_model_number: null,
        manufacturer_id: '1',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
        properties: [
          { id: '1', value: false },
          { id: '2', value: 'string' },
          { id: '3', value: 2 },
        ],
      });
    });
  });

  describe('useGetCatalogueItems', () => {
    it('sends request to fetch catalogue items data and returns successful response', async () => {
      const { result } = renderHook(() => useGetCatalogueItems('5'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(catalogueItemData('5'));
    });
  });

  describe('useGetCatalogueItem', () => {
    it('sends request to fetch catalogue items data and returns successful response', async () => {
      const { result } = renderHook(() => useGetCatalogueItem('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(
        CatalogueItemsJSON.filter(
          (catalogueItem) => catalogueItem.id === '1'
        )[0]
      );
    });
  });

  describe('useGetCatalogueItemIds', () => {
    it('sends requests to fetch multiple catalogue items data and returns successful response for each', async () => {
      const { result } = renderHook(() => useGetCatalogueItemIds(['1', '2']), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        result.current.forEach((query) => expect(query.isSuccess).toBeTruthy());
      });

      expect(result.current[0].data).toEqual(
        CatalogueItemsJSON.filter(
          (catalogueItem) => catalogueItem.id === '1'
        )[0]
      );
      expect(result.current[1].data).toEqual(
        CatalogueItemsJSON.filter(
          (catalogueItem) => catalogueItem.id === '2'
        )[0]
      );
    });
  });

  describe('useDeleteCatalogueItem', () => {
    let mockDataView: CatalogueItem;
    beforeEach(() => {
      mockDataView = {
        name: 'test',
        id: '1',
        catalogue_category_id: '3',
        description: '',
        cost_gbp: 0,
        cost_to_rework_gbp: null,
        days_to_replace: 0,
        days_to_rework: null,
        expected_lifetime_days: null,
        drawing_link: null,
        drawing_number: null,
        notes: null,
        is_obsolete: false,
        item_model_number: null,
        manufacturer_id: '1',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
      };
    });

    it('posts a request to delete a catalogue Item and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteCatalogueItem(), {
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

  describe('usePatchCatalogueItem', () => {
    let mockDataPatch: CatalogueItemPatch;
    beforeEach(() => {
      mockDataPatch = {
        name: 'test',
      };
    });
    it('posts a request to edit a catalogue item and returns successful response', async () => {
      const { result } = renderHook(() => usePatchCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate({ id: '90', catalogueItem: mockDataPatch });
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        catalogue_category_id: '4',
        name: 'test',
        description: 'High-resolution cameras for beam characterization. 4',
        properties: [
          {
            id: '1',
            name: 'Resolution',
            value: 24,
            unit: 'megapixels',
            unit_id: '1',
          },
          {
            id: '2',
            name: 'Frame Rate',
            value: 240,
            unit: 'fps',
            unit_id: '2',
          },
          {
            id: '3',
            name: 'Sensor Type',
            value: 'CCD',
            unit: null,
            unit_id: null,
          },
          {
            id: '4',
            name: 'Sensor brand',
            value: 'Nikon',
            unit: null,
            unit_id: null,
          },
          { id: '5', name: 'Broken', value: false, unit: null, unit_id: null },
          {
            id: '6',
            name: 'Older than five years',
            value: true,
            unit: null,
            unit_id: null,
          },
        ],
        id: '90',
      });
    });
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
            expected_lifetime_days: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            notes: null,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                id: '90',
                name: 'center wavelength',
                value: 10,
                unit: 'fps',
                unit_id: '2',
              },
            ],
            id: '657305e51e468454e97b638b',
            ...CREATED_MODIFIED_TIME_VALUES,
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
            expected_lifetime_days: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            notes: null,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                id: '90',
                name: 'center wavelength',
                value: 10,
                unit: 'fps',
                unit_id: '2',
              },
            ],
            id: '657324df1e468454e97b638e',
            ...CREATED_MODIFIED_TIME_VALUES,
          },
        ],
        targetCatalogueCategory: {
          name: 'RF Lenses',
          is_leaf: true,
          parent_id: '655ca56c1c251a2a828ca906',
          properties: [
            {
              id: '91',
              name: 'center wavelength',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'fps',
              unit_id: '2',
              mandatory: true,
              allowed_values: null,
            },
          ],
          id: '657305bc1e468454e97b638a',
          code: 'rf-lenses',
          ...CREATED_MODIFIED_TIME_VALUES,
        },
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
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
      } as CatalogueCategory;

      const { result } = renderHook(() => useMoveToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        { message: 'Something went wrong', name: 'test', state: 'error' },
        { message: 'Something went wrong', name: 'test_copy1', state: 'error' },
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
            manufacturer_id: '1',
            notes: null,
            name: 'test',
            description: null,
            cost_gbp: 20,
            cost_to_rework_gbp: null,
            days_to_replace: 2,
            days_to_rework: null,
            expected_lifetime_days: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                id: '90',
                name: 'center wavelength',
                value: 10,
                unit: 'fps',
                unit_id: '2',
              },
            ],
            id: '657305e51e468454e97b638b',
            ...CREATED_MODIFIED_TIME_VALUES,
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
            expected_lifetime_days: null,
            drawing_number: null,
            drawing_link: null,
            item_model_number: null,
            notes: null,
            is_obsolete: false,
            obsolete_reason: null,
            obsolete_replacement_catalogue_item_id: null,
            properties: [
              {
                id: '90',
                name: 'center wavelength',
                value: 10,
                unit: 'fps',
                unit_id: '2',
              },
            ],
            id: '657324df1e468454e97b638e',
            ...CREATED_MODIFIED_TIME_VALUES,
          },
        ],
        targetCatalogueCategory: {
          name: 'RF Lenses',
          is_leaf: true,
          parent_id: '655ca56c1c251a2a828ca906',
          properties: [
            {
              id: '90',
              name: 'center wavelength',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'fps',
              unit_id: '2',
              mandatory: true,
              allowed_values: null,
            },
          ],
          id: '657305bc1e468454e97b638a',
          code: 'rf-lenses',
          ...CREATED_MODIFIED_TIME_VALUES,
        },
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
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

    it('sends requests to copy multiple catalogue items and returns unsuccessful response when the catalogue_category_id has not changed', async () => {
      props.targetCatalogueCategory = {
        ...props.targetCatalogueCategory,
        id: 'Error 500',
      } as CatalogueCategory;

      const { result } = renderHook(() => useCopyToCatalogueItem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(props);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([
        { message: 'Something went wrong', name: 'test', state: 'error' },
        { message: 'Something went wrong', name: 'test_copy1', state: 'error' },
      ]);
    });
  });
});
