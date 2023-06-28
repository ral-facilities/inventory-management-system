import { renderHook, waitFor } from '@testing-library/react';
import { useAddCatalogueCategory } from './catalogueCategory';
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

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
