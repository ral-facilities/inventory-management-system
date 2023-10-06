import { renderHook, waitFor } from '@testing-library/react';
import { useAddCatalogueItem } from './catalogueItem';
import { hooksWrapperWithProviders } from '../setupTests';
import { AddCatalogueItem } from '../app.types';

describe('catalogue items api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddCatalogueCategory', () => {
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
    it('posts a request to add a user session and returns successful response', async () => {
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
});
