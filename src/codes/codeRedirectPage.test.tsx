import { RenderResult, screen, waitFor } from '@testing-library/react';
import paths from '../paths';
import {
  getCatalogueItemById,
  getItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import CodeRedirectPage from './codeRedirectPage';

// Mock the navigate method
const navigateMock = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('Code redirect page component', () => {
  const createView = (params: Record<string, string>): RenderResult =>
    renderComponentWithRouterProvider(
      <CodeRedirectPage />,
      'codeRedirect',
      `${paths.codeRedirect}?${new URLSearchParams(params).toString()}`
    );

  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('shows the loading state before the redirect happens', () => {
    createView({ oid: 'KvT2Ox7n', type: 'system' });
    expect(screen.getByText('Redirecting')).toBeInTheDocument();
    expect(screen.queryByText('Redirect Failed')).not.toBeInTheDocument();
  });

  it('redirects to the system page when type is system', async () => {
    createView({
      oid: '65328f34a40ff5301575a4e3',
      type: 'system',
    });

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith(
        '/systems/65328f34a40ff5301575a4e3'
      )
    );
  });

  it('redirects to the item page when type is item', async () => {
    const item = getItemById('KvT2Ox7n');
    const catalogueItem = getCatalogueItemById(item.catalogue_item_id)!;

    createView({ oid: item.id, type: 'item' });

    await waitFor(
      () =>
        expect(navigateMock).toHaveBeenCalledWith(
          `/catalogue/${catalogueItem.catalogue_category_id}/items/${item.catalogue_item_id}/items/${item.id}`
        ),
      { timeout: 5000 }
    );
  });

  it.each([
    ['missing the type', { oid: 'KvT2Ox7n' }],
    ['missing the oid', { type: 'system' }],
    ['an unknown type', { oid: 'KvT2Ox7n', type: 'catalogue_item' }],
    ['no params', {}],
  ])(
    'shows an error when the search params are invalid: %s',
    async (_name, params) => {
      createView(params);

      expect(await screen.findByText('Redirect Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to parse redirect values')
      ).toBeInTheDocument();
      expect(navigateMock).not.toHaveBeenCalled();
    }
  );

  it('shows an error when the item cannot be retrieved', async () => {
    createView({ oid: 'does-not-exist', type: 'item' });

    await waitFor(() => {
      expect(screen.getByText('Redirect Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to retrieve item details')
      ).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
