import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
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
  useCatalogueCategory,
  useCatalogueCategoryById,
  useCopyToCatalogueCategory,
  useDeleteCatalogueCategory,
  useEditCatalogueCategory,
  useMoveToCatalogueCategory,
} from './catalogueCategory';

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

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useCatalogueCategory', () => {
    it('sends request to fetch parent catalogue category data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueCategory(false, '2'), {
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

    it.todo(
      'sends axios request to fetch parent catalogue category data and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends axios request to fetch catalogue breadcrumbs data and throws an appropriate error on failure'
    );
  });

  describe('useCatalogueCategoryById', () => {
    it('sends request to fetch a single catalogue category data and returns successful response', async () => {
      const { result } = renderHook(() => useCatalogueCategoryById('1'), {
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

    it.todo(
      'sends axios request to fetch a single catalogue category and throws an appropriate error on failure'
    );
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
      axiosPatchSpy = jest.spyOn(axios, 'patch');

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

    it.todo(
      'sends axios request to fetch a single catalogue category and throws an appropriate error on failure'
    );
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
        existingCategoryCodes: [],
      };

      axiosPostSpy = jest.spyOn(axios, 'post');
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
        existingCategoryCodes: [''],
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
        existingCategoryCodes: [''],
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

    it('sends requests to copy multiple catalogue categories to root while renaming those with codes that are already present', async () => {
      const { result } = renderHook(() => useCopyToCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      copyToCatalogueCategory.existingCategoryCodes = [
        ...mockCatalogueCategories.map((category) => category.code),
        mockCatalogueCategories[1].code + '_copy_1',
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

    it.todo(
      'sends axios request to copy catalogue category and throws an appropriate error on failure'
    );
  });
});
