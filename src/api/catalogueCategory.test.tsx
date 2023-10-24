import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddCatalogueCategory,
  useCatalogueCategory,
  useCatalogueCategoryById,
  useDeleteCatalogueCategory,
  useEditCatalogueCategory,
} from './catalogueCategory';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
} from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';

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
        name: 'test',
        parent_id: null,
        id: '1',
        code: 'test',
        path: '/test',
        parent_path: '/',
        is_leaf: false,
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
        name: 'test',
        parent_id: null,
        id: '1',
        code: 'test',
        path: '/test',
        parent_path: '/',
        is_leaf: false,
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
        path: '/test',
        parent_path: '/',
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
    it('sends request to fetch catalogue category data and returns successful response', async () => {
      const { result } = renderHook(
        () => useCatalogueCategory(false, undefined, '/motion'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

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
          parent_path: '/motion',
          path: '/motion/actuators',
        },
      ]);
    });

    it('sends request to fetch parent catalogue category data and returns successful response', async () => {
      const { result } = renderHook(
        () => useCatalogueCategory(false, '/motion', undefined),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([
        {
          code: 'motion',
          id: '2',
          is_leaf: false,
          name: 'Motion',
          parent_id: null,
          parent_path: '/',
          path: '/motion',
        },
      ]);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });

  describe('useCatalogueCategoryByID', () => {
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
        parent_path: '/',
        path: '/beam-characterization',
      });
    });

    it.todo(
      'sends axios request to fetch a single catalogue category and throws an appropriate error on failure'
    );
  });
});
