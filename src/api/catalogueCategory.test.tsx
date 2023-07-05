import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddCatalogueCategory,
  useCatalogueCategory,
} from './catalogueCategory';
import { AddCatalogueCategory } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';

describe('catalogue category api functions', () => {
  let mockData: AddCatalogueCategory;
  beforeEach(() => {
    mockData = {
      name: 'test',
      is_leaf: false,
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddCatalogueCategory', () => {
    it('posts a request to add a user session and returns successful response', async () => {
      const { result } = renderHook(() => useAddCatalogueCategory(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockData);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        name: 'test',
        parent_id: null,
        id: '1',
        code: 'test',
        path: 'test',
        parent_path: '',
        is_leaf: false,
      });
    });

    describe('useCatalogueCategory', () => {
      it('sends request to fetch catalogue catagory data and returns successful response', async () => {
        const { result } = renderHook(
          () => useCatalogueCategory(undefined, '/motion'),
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

      it('sends request to fetch parent catalogue catagory data and returns successful response', async () => {
        const { result } = renderHook(
          () => useCatalogueCategory('/motion', undefined),
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
            parent_id: '',
            parent_path: '/',
            path: '/motion',
          },
        ]);
      });

      it.todo(
        'sends axios request to fetch records and throws an appropriate error on failure'
      );
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
