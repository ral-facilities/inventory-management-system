import React from 'react';
import { renderComponentWithMemoryRouter } from '../../setupTests';
import { screen, waitFor } from '@testing-library/react';
import CatalogueItemsLandingPage from './catalogueItemsLandingPage.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Items Landing Page', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<CatalogueItemsLandingPage />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders text correctly (only basic details given)', async () => {
    createView('/inventory-management-system/catalogue/items/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'Back to Cameras table view',
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
  });

  it('renders text correctly (extra details given)', async () => {
    createView('/inventory-management-system/catalogue/items/2');

    await waitFor(() => {
      expect(screen.getByText('Cameras 2')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'Back to Cameras table view',
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
  });

  it('renders no item page correctly', async () => {
    createView('/inventory-management-system/catalogue/items/1fds');
    await waitFor(() => {
      expect(
        screen.getByText(
          `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });
    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeDisabled();
    const homeButton = screen.getByRole('link', { name: 'Home' });
    expect(homeButton).toBeInTheDocument();
  });

  it('toggles the properties so it is either visible or hidden', async () => {
    createView('/inventory-management-system/catalogue/items/1');
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
    createView('/inventory-management-system/catalogue/items/1');
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
    createView('/inventory-management-system/catalogue/items/1');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
  it('toggles the manufacturer so it is either visible or hidden', async () => {
    createView('/inventory-management-system/catalogue/items/1');
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
    createView('/inventory-management-system/catalogue/items/1');

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
    createView('/inventory-management-system/catalogue/items/6');

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
    createView('/inventory-management-system/catalogue/items/89');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Click here' })
    ).toBeInTheDocument();
  });

  it('prints when the button is clicked', async () => {
    const spy = jest.spyOn(window, 'print').mockImplementation(() => {});
    createView('/inventory-management-system/catalogue/items/89');

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
});
