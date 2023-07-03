import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddCatalogueCategory,
  useCatalogueCategory,
} from './catalogueCategory';
import { CatalogueCategory } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';

describe('catalogue category api functions', () => {
  let mockData: CatalogueCategory;
  beforeEach(() => {
    mockData = {
      name: 'test',
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
            isLeaf: false,
            name: 'Actuators',
            parentId: '2',
            parentPath: '/motion',
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
            isLeaf: false,
            name: 'Motion',
            parentId: '',
            parentPath: '/',
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
