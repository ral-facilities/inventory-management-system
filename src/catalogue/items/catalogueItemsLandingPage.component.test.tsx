import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderComponentWithMemoryRouter } from '../../testUtils';
import { paths } from '../../view/viewTabs.component';
import CatalogueItemsLandingPage from './catalogueItemsLandingPage.component';

const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Catalogue Items Landing Page', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(
      <Routes>
        <Route
          path={paths.catalogueItem}
          element={<CatalogueItemsLandingPage />}
        />
      </Routes>,
      path
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text correctly (only basic details given)', async () => {
    createView('/catalogue/item/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'cameras',
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();

    expect(screen.getByText('Notes:')).toBeInTheDocument();
  });

  it('renders text correctly (extra details given)', async () => {
    createView('/catalogue/item/2');

    await waitFor(() => {
      expect(screen.getByText('Cameras 2')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'cameras',
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 2')
    ).toBeInTheDocument();

    expect(screen.getByText('http://example-drawing-link.com')).toHaveAttribute(
      'href',
      'http://example-drawing-link.com'
    );

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();

    expect(screen.getByText('Notes:')).toBeInTheDocument();
  });

  it('renders no item page correctly', async () => {
    createView('/catalogue/item/1fds');
    await waitFor(() => {
      expect(
        screen.getByText(
          `This catalogue item doesn't exist. Please click the Home button on the top left of you screen to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });
  });

  it('toggles the properties so it is either visible or hidden', async () => {
    createView('/catalogue/item/1');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item properties')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText(
      'Close catalogue item properties'
    );

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show catalogue item properties')
      ).toBeInTheDocument();
    });
  });

  it('toggles the details so it is either visible or hidden', async () => {
    createView('/catalogue/item/1');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item details')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('Close catalogue item details');

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show catalogue item details')
      ).toBeInTheDocument();
    });
  });

  it('shows the loading indicator', async () => {
    createView('/catalogue/item/1');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
  it('toggles the manufacturer so it is either visible or hidden', async () => {
    createView('/catalogue/item/1');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item manufacturer details')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText(
      'Close catalogue item manufacturer details'
    );

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show catalogue item manufacturer details')
      ).toBeInTheDocument();
    });
  });

  it('opens and closes the edit catalogue item dialog', async () => {
    createView('/catalogue/item/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'Edit',
    });
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
    createView('/catalogue/item/6');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 27')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'Edit',
    });
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
    createView('/catalogue/item/89');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Click here' })
    ).toBeInTheDocument();
  });

  it('prints when the button is clicked', async () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    createView('/catalogue/item/89');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: 'Print' });

    await user.click(printButton);
    // Assert that the window.print() function was called
    expect(spy).toHaveBeenCalled();

    // Clean up the mock
    spy.mockRestore();
  });

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/89');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'energy-meters' })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('link', {
      name: 'energy-meters',
    });

    await user.click(breadcrumb);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue/5');
  });

  it('navigates back to the root directory', async () => {
    createView('/catalogue/item/89');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'energy-meters' })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');
  });

  it('navigates to items table view', async () => {
    createView('/catalogue/item/89');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Items' })).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Items',
    });
    expect(url).toHaveAttribute('href', '/catalogue/item/89/items');
  });

  it('landing page renders data correctly when optional values are null', async () => {
    createView('/catalogue/item/33');

    await waitFor(() => {
      expect(screen.getByText('Cameras 14')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item details')
    ).toBeInTheDocument();

    const toggleButtonDetails = screen.getByLabelText(
      'Close catalogue item details'
    );

    await user.click(toggleButtonDetails);

    expect(
      screen.getByLabelText('Close catalogue item properties')
    ).toBeInTheDocument();

    const toggleButtonProperties = screen.getByLabelText(
      'Close catalogue item properties'
    );

    await user.click(toggleButtonProperties);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer D')).toBeInTheDocument();
    });
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getAllByText('None')[0]).toBeInTheDocument();
    expect(screen.getByText('Telephone number')).toBeInTheDocument();
    expect(screen.getAllByText('None')[1]).toBeInTheDocument();
  });
});
