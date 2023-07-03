import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../setupTests';
import { useCatalogueCategory } from './catalogueCategory';

describe('catalogue category api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useExperiment', () => {
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
});
