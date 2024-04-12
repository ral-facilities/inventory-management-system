import { renderHook, waitFor } from '@testing-library/react';
import CatalogueItemPropertyTemplatesJSON from '../mocks/CatalogueItemPropertyTemplates.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useCatalogueItemPropertyTemplates } from './catalogue_item_property_templates';

describe('useCatalogueItemPropertyTemplates', () => {
  it('sends request to fetch the catalogue item property templates and returns successful response', async () => {
    const { result } = renderHook(() => useCatalogueItemPropertyTemplates(), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(CatalogueItemPropertyTemplatesJSON);
  });
});
