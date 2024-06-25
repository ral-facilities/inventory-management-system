import { renderHook, waitFor } from '@testing-library/react';
import { MockInstance } from 'vitest';
import {
  AddPropertyMigration,
  CopyToCatalogueCategory,
  EditPropertyMigration,
  MoveToCatalogueCategory,
} from '../app.types';
import handleTransferState from '../handleTransferState';
import {
  CREATED_MODIFIED_TIME_VALUES,
  getCatalogueCategoryById,
  hooksWrapperWithProviders,
} from '../testUtils';
import { imsApi } from './api';
import {
  CatalogueCategory,
  CatalogueCategoryPatch,
  CatalogueCategoryPost,
} from './api.types';
import {
  useAddCatalogueCategory,
  useAddCatalogueCategoryProperty,
  useCatalogueBreadcrumbs,
  useCatalogueCategories,
  useCatalogueCategory,
  useCopyToCatalogueCategory,
  useDeleteCatalogueCategory,
  useEditCatalogueCategory,
  useEditCatalogueCategoryProperty,
  useMoveToCatalogueCategory,
} from './catalogueCategories';

vi.mock('../handleTransferState');

describe('catalogue categories api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddCatalogueCategory', () => {
    let mockDataAdd: CatalogueCategoryPost;
    beforeEach(() => {
      mockDataAdd = {
        name: 'test',
        is_leaf: false,
      };
    });
    it('posts a request to add a catalogue category and returns successful response', async () => {
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
    let mockDataEdit: CatalogueCategoryPatch;
    beforeEach(() => {
      mockDataEdit = {
        name: 'test',
      };
    });
    it('sends a patch request to edit a catalogue category and returns successful response', async () => {
      const { result } = renderHook(() => useEditCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate({ id: '4', catalogueCategory: mockDataEdit });
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        properties: [
          {
            id: '1',
            allowed_values: null,
            mandatory: true,
            name: 'Resolution',
            type: 'number',
            unit: 'megapixels',
            unit_id: '1',
          },
          {
            id: '2',
            allowed_values: null,
            mandatory: false,
            name: 'Frame Rate',
            type: 'number',
            unit: 'fps',
            unit_id: '2',
          },
          {
            id: '3',
            allowed_values: null,
            mandatory: true,
            name: 'Sensor Type',
            type: 'string',
            unit: null,
            unit_id: null,
          },
          {
            id: '4',
            allowed_values: null,
            mandatory: false,
            name: 'Sensor brand',
            type: 'string',
            unit: null,
            unit_id: null,
          },
          {
            id: '5',
            allowed_values: null,
            mandatory: true,
            name: 'Broken',
            type: 'boolean',
            unit: null,
            unit_id: null,
          },
          {
            id: '6',
            allowed_values: null,
            mandatory: false,
            name: 'Older than five years',
            type: 'boolean',
            unit: null,
            unit_id: null,
          },
        ],
        code: 'cameras',
        id: '4',
        is_leaf: true,
        name: 'test',
        parent_id: '1',
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
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
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
      };
    });

    it('posts a request to delete a catalogue category and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({ status: 204 });
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
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
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
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
      });
    });
  });

  describe('useMoveToCatalogueCategory', () => {
    const mockSelectedCatalogueCategories: CatalogueCategory[] = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_leaf: false,
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
      {
        id: '6',
        name: 'Wavefront Sensors',
        parent_id: '1',
        code: 'wavefront-sensors',
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Wavefront Measurement Range',
            type: 'string',
            unit: null,
            unit_id: null,
            allowed_values: null,
            mandatory: true,
          },
          {
            id: '2',
            name: 'Spatial Resolution',
            type: 'number',
            unit: 'micrometers',
            unit_id: '4',
            mandatory: false,
            allowed_values: null,
          },
        ],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
      {
        id: '5',
        name: 'Energy Meters',
        parent_id: '1',
        code: 'energy-meters',
        is_leaf: true,
        properties: [
          {
            id: '3',
            name: 'Measurement Range',
            type: 'number',
            unit: 'Joules',
            unit_id: '3',
            mandatory: true,
            allowed_values: null,
          },
          {
            id: '4',
            name: 'Accuracy',
            type: 'string',
            unit: null,
            unit_id: null,
            allowed_values: null,
            mandatory: false,
          },
        ],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
    ];

    let moveToCatalogueCategory: MoveToCatalogueCategory;

    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      axiosPatchSpy = vi.spyOn(imsApi, 'patch');

      moveToCatalogueCategory = {
        selectedCategories: mockSelectedCatalogueCategories,
        targetCategory: null,
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
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
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
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
  });

  describe('useCopyToCatalogueCategory', () => {
    const mockCatalogueCategories: CatalogueCategory[] = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_leaf: false,
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
      {
        id: '6',
        name: 'Wavefront Sensors',
        parent_id: '1',
        code: 'wavefront-sensors',
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Wavefront Measurement Range',
            type: 'string',
            unit: null,
            unit_id: null,
            allowed_values: null,
            mandatory: true,
          },
          {
            id: '2',
            name: 'Spatial Resolution',
            type: 'number',
            unit: 'micrometers',
            unit_id: '4',
            allowed_values: null,
            mandatory: false,
          },
        ],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
      {
        id: '5',
        name: 'Energy Meters',
        parent_id: '1',
        code: 'energy-meters',
        is_leaf: true,
        properties: [
          {
            id: '3',
            name: 'Measurement Range',
            type: 'number',
            unit: 'Joules',
            unit_id: '3',
            allowed_values: null,
            mandatory: true,
          },
          {
            id: '4',
            name: 'Accuracy',
            type: 'string',
            unit: null,
            unit_id: null,
            allowed_values: null,
            mandatory: false,
          },
        ],
        ...CREATED_MODIFIED_TIME_VALUES,
      },
    ];

    let copyToCatalogueCategory: CopyToCatalogueCategory;

    let axiosPostSpy: MockInstance;

    beforeEach(() => {
      copyToCatalogueCategory = {
        selectedCategories: mockCatalogueCategories,
        targetCategory: null,
        existingCategoryCodes: [],
      };

      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
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
        properties: [],
        ...CREATED_MODIFIED_TIME_VALUES,
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
  });

  describe('useEditCatalogueCategoryProperty', () => {
    let mockDataEditProperty: EditPropertyMigration;

    beforeEach(() => {
      mockDataEditProperty = {
        catalogueCategory: getCatalogueCategoryById('12') as CatalogueCategory,
        property_id: '19',
        property: {
          name: 'test',
          allowed_values: { type: 'list', values: ['x', 'y', 'z', 'a'] },
        },
      };
    });
    it('sends a patch request to edit a property and returns successful response', async () => {
      const { result } = renderHook(() => useEditCatalogueCategoryProperty(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);

      result.current.mutate(mockDataEditProperty);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        allowed_values: {
          type: 'list',
          values: ['x', 'y', 'z', 'a'],
        },
        id: '19',
        mandatory: false,
        name: 'test',
        type: 'string',
        unit: null,
        unit_id: null,
      });

      expect(handleTransferState).toBeCalledTimes(2);
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Editing property test in Dry Vacuum Pumps',
          name: 'Dry Vacuum Pumps',
          state: 'information',
        },
      ]);

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Successfully edited property test in Dry Vacuum Pumps',
          name: 'Dry Vacuum Pumps',
          state: 'success',
        },
      ]);
    });

    it('sends a patch request to edit a property and returns unsuccessful response', async () => {
      mockDataEditProperty.property.name = 'Error 500';
      const { result } = renderHook(() => useEditCatalogueCategoryProperty(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataEditProperty);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeFalsy();
      });
      expect(handleTransferState).toBeCalledTimes(2);
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Editing property Error 500 in Dry Vacuum Pumps',
          name: 'Dry Vacuum Pumps',
          state: 'information',
        },
      ]);

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Something went wrong',
          name: 'Dry Vacuum Pumps',
          state: 'error',
        },
      ]);
    });
  });
  describe('useAddCatalogueCategoryProperty', () => {
    let mockDataAddProperty: AddPropertyMigration;
    beforeEach(() => {
      mockDataAddProperty = {
        catalogueCategory: getCatalogueCategoryById('4') as CatalogueCategory,
        property: {
          name: 'test',
          type: 'number',
          unit_id: '1',
          default_value: 2,
          mandatory: false,
        },
      };
    });
    it('posts a request to add property and returns successful response', async () => {
      const { result } = renderHook(() => useAddCatalogueCategoryProperty(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAddProperty);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        id: '1',
        mandatory: false,
        name: 'test',
        type: 'number',
        unit_id: '1',
      });

      expect(handleTransferState).toBeCalledTimes(2);
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Adding property test in Cameras',
          name: 'Cameras',
          state: 'information',
        },
      ]);

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Successfully added property test in Cameras',
          name: 'Cameras',
          state: 'success',
        },
      ]);
    });

    it('posts a request to add property and returns unsuccessful response', async () => {
      mockDataAddProperty.property.name = 'Error 500';
      const { result } = renderHook(() => useAddCatalogueCategoryProperty(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAddProperty);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeFalsy();
      });
      expect(handleTransferState).toBeCalledTimes(2);
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Adding property Error 500 in Cameras',
          name: 'Cameras',
          state: 'information',
        },
      ]);

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Something went wrong',
          name: 'Cameras',
          state: 'error',
        },
      ]);
    });
  });
});
