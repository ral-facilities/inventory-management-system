import { renderHook, waitFor } from '@testing-library/react';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  CopyToCatalogueCategory,
  EditCatalogueCategory,
  MoveToCatalogueCategory,
} from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  useAddCatalogueCategory,
  useCatalogueBreadcrumbs,
  useCatalogueCategories,
  useCatalogueCategory,
  useCopyToCatalogueCategory,
  useDeleteCatalogueCategory,
  useEditCatalogueCategory,
  useMoveToCatalogueCategory,
} from './catalogueCategory';
import { imsApi } from './api';

describe('catalogue category api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddCatalogueCategory', () => {
    let mockDataAdd: AddCatalogueCategory;
    beforeEach(() => {
      mockDataAdd = {
        name: 'test',
        is_leaf: false,
      };
    });
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useAddCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAdd);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        id: '1',
        is_leaf: false,
        name: 'test',
        parent_id: null,
      });
    });
  });

  describe('useEditCatalogueCategory', () => {
    let mockDataEdit: EditCatalogueCategory;
    beforeEach(() => {
      mockDataEdit = {
        name: 'test',
        id: '4',
      };
    });
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useEditCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataEdit);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        catalogue_item_properties: [
          {
            mandatory: true,
            name: 'Resolution',
            type: 'number',
            unit: 'megapixels',
          },
          { mandatory: false, name: 'Frame Rate', type: 'number', unit: 'fps' },
          { mandatory: true, name: 'Sensor Type', type: 'string' },
          { mandatory: false, name: 'Sensor brand', type: 'string' },
          { mandatory: true, name: 'Broken', type: 'boolean' },
          { mandatory: false, name: 'Older than five years', type: 'boolean' },
        ],
        code: 'cameras',
        id: '4',
        is_leaf: true,
        name: 'test',
        parent_id: '1',
      });
    });
  });

  describe('useDeleteCatalogueCategory', () => {
    let mockDataView: CatalogueCategory;
    beforeEach(() => {
      mockDataView = {
        name: 'test',
        parent_id: null,
        id: '1',
        code: 'test',
        is_leaf: false,
      };
    });
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });
  });

  describe('useCatalogueCategories', () => {
    it('sends request to fetch parent catalogue category data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueCategories(false, '2'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([
        {
          code: 'actuators',
          id: '8',
          is_leaf: false,
          name: 'Actuators',
          parent_id: '2',
        },
      ]);
    });
  });

  describe('useCatalogueBreadcrumbs', () => {
    it('sends request to fetch catalogue breadcrumbs data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueBreadcrumbs('2'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        full_trail: true,
        id: '2',
        trail: [['2', 'motion']],
      });
    });
  });

  describe('useCatalogueCategory', () => {
    it('sends request to fetch a single catalogue category data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueCategory('1'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        code: 'beam-characterization',
        id: '1',
        is_leaf: false,
        name: 'Beam Characterization',
        parent_id: null,
      });
    });
  });

  describe('useMoveToCatalogueCategory', () => {
    const mockSelectedCatalogueCategories = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_leaf: false,
      },
      {
        id: '6',
        name: 'Wavefront Sensors',
        parent_id: '1',
        code: 'wavefront-sensors',
        is_leaf: true,
        catalogue_item_properties: [
          {
            name: 'Wavefront Measurement Range',
            type: 'string',
            mandatory: true,
          },
          {
            name: 'Spatial Resolution',
            type: 'number',
            unit: 'micrometers',
            mandatory: false,
          },
        ],
      },
      {
        id: '5',
        name: 'Energy Meters',
        parent_id: '1',
        code: 'energy-meters',
        is_leaf: true,
        catalogue_item_properties: [
          {
            name: 'Measurement Range',
            type: 'number',
            unit: 'Joules',
            mandatory: true,
          },
          {
            name: 'Accuracy',
            type: 'string',
            mandatory: false,
          },
        ],
      },
    ];

    let moveToCatalogueCategory: MoveToCatalogueCategory;

    let axiosPatchSpy;

    beforeEach(() => {
      axiosPatchSpy = jest.spyOn(imsApi, 'patch');

      moveToCatalogueCategory = {
        selectedCategories: mockSelectedCatalogueCategories,
        targetCategory: null,
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends requests to move a single or multiple catalogue categories data to root and returns successful response', async () => {
      const { result } = renderHook(() => useMoveToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);
      result.current.mutate(moveToCatalogueCategory);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(
          `/v1/catalogue-categories/${category.id}`,
          {
            parent_id: null,
          }
        )
      );
      expect(result.current.data).toEqual([
        {
          message: 'Successfully moved to Root',
          name: 'Wavefront Sensors',
          state: 'success',
        },
        {
          message: 'Successfully moved to Root',
          name: 'Energy Meters',
          state: 'success',
        },
        {
          message:
            'A catalogue category with the same name already exists within the parent catalogue category',
          name: 'test_dup',
          state: 'error',
        },
      ]);
    });

    it('sends requests to move a single or multiple catalogue categories data to another category and returns successful response', async () => {
      const { result } = renderHook(() => useMoveToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      const targetCategory: CatalogueCategory = {
        id: '6',
        parent_id: null,
        name: 'Wavefront Sensors',
        code: 'wavefront-sensors',
        is_leaf: false,
      };
      moveToCatalogueCategory.targetCategory = targetCategory;

      result.current.mutate(moveToCatalogueCategory);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(
          `/v1/catalogue-categories/${category.id}`,
          {
            parent_id: targetCategory.id,
          }
        )
      );
      expect(result.current.data).toEqual([
        {
          message: 'Successfully moved to Wavefront Sensors',
          name: 'Wavefront Sensors',
          state: 'success',
        },
        {
          message: 'Successfully moved to Wavefront Sensors',
          name: 'Energy Meters',
          state: 'success',
        },
        {
          message:
            'A catalogue category with the same name already exists within the parent catalogue category',
          name: 'test_dup',
          state: 'error',
        },
      ]);
    });

    it('sends requests to move multiple catalogue categories to another category and returns 403 errors for each', async () => {
      const { result } = renderHook(() => useMoveToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      const targetCategory: CatalogueCategory = {
        id: 'Error 403',
        name: 'Vacuum Pumps',
        parent_id: '3',
        code: 'vacuum-pumps',
        is_leaf: false,
      };
      moveToCatalogueCategory.targetCategory = targetCategory;

      result.current.mutate(moveToCatalogueCategory);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(
          `/v1/catalogue-categories/${category.id}`,
          {
            parent_id: targetCategory.id,
          }
        )
      );
      expect(result.current.data).toEqual([
        { message: '403', name: 'test_dup', state: 'error' },
        { message: '403', name: 'Wavefront Sensors', state: 'error' },
        { message: '403', name: 'Energy Meters', state: 'error' },
      ]);
    });
  });

  describe('useCopyToCatalogueCategory', () => {
    const mockCatalogueCategories: CatalogueCategory[] = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_leaf: false,
      },
      {
        id: '6',
        name: 'Wavefront Sensors',
        parent_id: '1',
        code: 'wavefront-sensors',
        is_leaf: true,
        catalogue_item_properties: [
          {
            name: 'Wavefront Measurement Range',
            type: 'string',
            mandatory: true,
          },
          {
            name: 'Spatial Resolution',
            type: 'number',
            unit: 'micrometers',
            mandatory: false,
          },
        ],
      },
      {
        id: '5',
        name: 'Energy Meters',
        parent_id: '1',
        code: 'energy-meters',
        is_leaf: true,
        catalogue_item_properties: [
          {
            name: 'Measurement Range',
            type: 'number',
            unit: 'Joules',
            mandatory: true,
          },
          {
            name: 'Accuracy',
            type: 'string',
            mandatory: false,
          },
        ],
      },
    ];

    let copyToCatalogueCategory: CopyToCatalogueCategory;

    let axiosPostSpy;

    beforeEach(() => {
      copyToCatalogueCategory = {
        selectedCategories: mockCatalogueCategories,
        targetCategory: null,
        existingCategoryNames: [],
      };

      axiosPostSpy = jest.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sends requests to copy multiple catalogue categories to root and returns successful response', async () => {
      const { result } = renderHook(() => useCopyToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate({
        selectedCategories: mockCatalogueCategories,
        targetCategory: null,
        existingCategoryNames: [''],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/catalogue-categories`, {
          ...category,
          parent_id: null,
        })
      );
      expect(result.current.data).toEqual([
        {
          message: 'Successfully copied to Root',
          name: 'Wavefront Sensors',
          state: 'success',
        },
        {
          message: 'Successfully copied to Root',
          name: 'Energy Meters',
          state: 'success',
        },
        {
          message:
            'A catalogue category with the same name already exists within the parent catalogue category',
          name: 'test_dup',
          state: 'error',
        },
      ]);
    });

    it('sends requests to copy multiple catalogue categories to another category and returns successful response', async () => {
      const { result } = renderHook(() => useCopyToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      const targetCategory: CatalogueCategory = {
        id: '6',
        parent_id: null,
        name: 'Wavefront Sensors',
        code: 'wavefront-sensors',
        is_leaf: false,
      };
      copyToCatalogueCategory.targetCategory = targetCategory;

      result.current.mutate({
        selectedCategories: mockCatalogueCategories,
        targetCategory: targetCategory,
        existingCategoryNames: [''],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/catalogue-categories`, {
          ...category,
          parent_id: targetCategory.id,
        })
      );
      expect(result.current.data).toEqual([
        {
          message: 'Successfully copied to Wavefront Sensors',
          name: 'Wavefront Sensors',
          state: 'success',
        },
        {
          message: 'Successfully copied to Wavefront Sensors',
          name: 'Energy Meters',
          state: 'success',
        },
        {
          message:
            'A catalogue category with the same name already exists within the parent catalogue category',
          name: 'test_dup',
          state: 'error',
        },
      ]);
    });

    it('sends requests to copy multiple catalogue categories to another category and returns 403 error', async () => {
      const { result } = renderHook(() => useCopyToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      const targetCategory: CatalogueCategory = {
        id: 'Error 403',
        name: 'Vacuum Pumps',
        parent_id: '3',
        code: 'vacuum-pumps',
        is_leaf: false,
      };
      copyToCatalogueCategory.targetCategory = targetCategory;

      result.current.mutate({
        selectedCategories: mockCatalogueCategories,
        targetCategory: targetCategory,
        existingCategoryNames: [''],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToCatalogueCategory.selectedCategories.map((category) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/catalogue-categories`, {
          ...category,
          parent_id: targetCategory.id,
        })
      );
      expect(result.current.data).toEqual([
        { message: '403', name: 'test_dup', state: 'error' },
        { message: '403', name: 'Wavefront Sensors', state: 'error' },
        { message: '403', name: 'Energy Meters', state: 'error' },
      ]);
    });

    it('sends requests to copy multiple catalogue categories to root while renaming those with codes that are already present', async () => {
      const { result } = renderHook(() => useCopyToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      copyToCatalogueCategory.existingCategoryNames = [
        ...mockCatalogueCategories.map((category) => category.name),
        mockCatalogueCategories[1].name + '_copy_1',
      ];
      result.current.mutate(copyToCatalogueCategory);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToCatalogueCategory.selectedCategories.map((category, index) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/catalogue-categories`, {
          ...category,
          parent_id: null,
          name:
            index === 1 ? category.name + '_copy_2' : category.name + '_copy_1',
        })
      );
      expect(result.current.data).toEqual([
        {
          message: 'Successfully copied to Root',
          name: 'test_dup_copy_1',
          state: 'success',
        },
        {
          message: 'Successfully copied to Root',
          name: 'Wavefront Sensors_copy_2',
          state: 'success',
        },
        {
          message: 'Successfully copied to Root',
          name: 'Energy Meters_copy_1',
          state: 'success',
        },
      ]);
    });
  });
});
