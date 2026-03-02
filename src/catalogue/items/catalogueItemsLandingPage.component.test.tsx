import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import APIConfigProvider from '../../apiConfigProvider.component';
import CatalogueItemsJSON from '../../mocks/CatalogueItems.json';
import { server } from '../../mocks/server';
import { RootState } from '../../state/store';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemsLandingPage from './catalogueItemsLandingPage.component';

const mockedUseNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Catalogue Items Landing Page', () => {
  let user: UserEvent;
  const createView = (path: string, preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <CatalogueItemsLandingPage />
      </APIConfigProvider>,
      'catalogueItem',
      path,
      preloadedState
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text correctly (only basic details given)', async () => {
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
  });

  it('renders text correctly (critical mode on with all details)', async () => {
    createView('/catalogue/6/items/10', {
      criticality: { isCriticalMode: true },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Wavefront sensors for precise optical measurements. 31'
        )
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText('Criticality:')).toHaveLength(2);
    expect(screen.getAllByText('-4.55')).toHaveLength(2);
  });

  it('renders text correctly (critical mode on without expected lifetime)', async () => {
    createView('/catalogue/6/items/9', {
      criticality: { isCriticalMode: true },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Wavefront sensors for precise optical measurements. 30'
        )
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText('Criticality:')).toHaveLength(2);
    expect(screen.getAllByLabelText('Criticality Warning')).toHaveLength(2);
  });

  it('renders text correctly (notes tab)', async () => {
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Notes'));

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders text correctly (empty property list)', async () => {
    server.use(
      http.get('/v1/catalogue-items/:id', async ({ params }) => {
        const { id } = params;

        const data = CatalogueItemsJSON.find((items) => items.id === id);

        if (!data) {
          return HttpResponse.json(
            { detail: 'Catalogue Item not found' },
            { status: 404 }
          );
        }

        return HttpResponse.json(
          { ...data, properties: [], expected_lifetime_days: null },
          { status: 200 }
        );
      })
    );
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getAllByText('None').length).toEqual(7);
  });

  it('renders text correctly (extra details given)', async () => {
    createView('/catalogue/4/items/2');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 2')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 2')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
  });

  it('shows the loading indicator', async () => {
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('opens and closes the edit catalogue item dialog', async () => {
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'catalogue items landing page actions menu',
      })
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the edit catalogue item dialog (more catalogue item details filled in)', async () => {
    createView('/catalogue/5/items/6');

    await waitFor(() => {
      expect(
        screen.getByText(
          'Precision energy meters for accurate measurements. 27'
        )
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'catalogue items landing page actions menu',
      })
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders obsolete replace id link', async () => {
    createView('/catalogue/5/items/89');

    await waitFor(() => {
      expect(
        screen.getByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Click here' })
      ).toBeInTheDocument();
    });
  });

  it('prints when the button is clicked', async () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    createView('/catalogue/5/items/89');

    await waitFor(() => {
      expect(
        screen.getByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', {
        name: 'catalogue items landing page actions menu',
      })
    );

    const printButton = screen.getByText('Print');

    await user.click(printButton);
    // Assert that the window.print() function was called
    expect(spy).toHaveBeenCalled();

    // Clean up the mock
    spy.mockRestore();
  });

  it('navigates to items table view', async () => {
    createView('/catalogue/5/items/89');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Items' })).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Items',
    });
    expect(url).toHaveAttribute('href', '/catalogue/5/items/89/items');
  });

  it('navigates to items page with spares definition applied', async () => {
    createView('/catalogue/5/items/89');
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: '0' })).toHaveLength(2);
    });

    const url = screen.getAllByRole('link', {
      name: '0',
    })[1];
    expect(url).toHaveAttribute(
      'href',
      '/catalogue/5/items/89/items?state=N4IgxgYiBcDaoEsAmMQGcCeaAuBTAtgHTYYAOuhAbgIYA2ArriADQg0NNygnmo4BOCAHYBzFmzqNUAZWwB7ftRFMAvgF11KoA'
    );
  });

  it('should not display spares number if spares definition is not defined', async () => {
    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );

    createView('/catalogue/5/items/89');
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await waitFor(() => {
      expect(screen.queryByText('Number of spares')).not.toBeInTheDocument();
    });
  });

  it('landing page renders data correctly when optional values are null', async () => {
    createView('/catalogue/4/items/33');

    await waitFor(() => {
      expect(
        screen.getByText(
          'High-resolution cameras for beam characterization. 14'
        )
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Manufacturer D')).toBeInTheDocument();
    });
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getAllByText('None')[0]).toBeInTheDocument();
    expect(screen.getByText('Telephone number')).toBeInTheDocument();
    expect(screen.getAllByText('None')[1]).toBeInTheDocument();
  });

  it('navigates to manufacturer landing page', async () => {
    createView('/catalogue/4/items/1');
    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    const url = await screen.findByText('Manufacturer A');
    expect(url).toHaveAttribute('href', '/manufacturers/1');
  });

  it('opens lightbox when clicking on primary image thumbnail', async () => {
    createView('/catalogue/4/items/1');

    await waitFor(() => {
      expect(
        screen.getByText('High-resolution cameras for beam characterization. 1')
      ).toBeInTheDocument();
    });

    expect(await screen.findByAltText('test')).toBeInTheDocument();

    const primaryImageElement = screen.getByAltText('test');

    expect(primaryImageElement).not.toHaveAttribute('disabled');

    await user.click(primaryImageElement);

    await waitFor(() => {
      within(screen.getByTestId('galleryLightBox'));
    });

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    await waitFor(() => {
      expect(
        galleryLightBox.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(
      galleryLightBox.getByText('Title: stfc-logo-blue-text')
    ).toBeInTheDocument();
  });
});
