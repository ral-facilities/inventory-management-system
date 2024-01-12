import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import ItemsLandingPage from './itemsLandingPage.component';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { paths } from '../view/viewTabs.component';

describe('Catalogue Items Landing Page', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(
      <Routes>
        <Route path={paths.item} element={<ItemsLandingPage />}></Route>
      </Routes>,
      path
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders text correctly (only basic details given)', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'Back to Cameras 1 items table view',
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();

    expect(screen.getByText('Asset Number')).toBeInTheDocument();
  });

  // it('renders text correctly (extra details given)', async () => {
  //   createView('/catalogue/item/2');

  //   await waitFor(() => {
  //     expect(screen.getByText('Cameras 2')).toBeInTheDocument();
  //   });

  //   await waitFor(() => {
  //     expect(
  //       screen.getByRole('link', {
  //         name: 'Back to Cameras table view',
  //       })
  //     ).toBeInTheDocument();
  //   });

  //   expect(screen.getByText('Description:')).toBeInTheDocument();
  //   expect(
  //     screen.getByText('High-resolution cameras for beam characterization. 2')
  //   ).toBeInTheDocument();

  //   expect(screen.getByText('http://example-drawing-link.com')).toHaveAttribute(
  //     'href',
  //     'http://example-drawing-link.com'
  //   );

  //   expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
  // });

  it('renders no item page correctly', async () => {
    createView('/catalogue/item/1/items/KvT2');
    await waitFor(() => {
      expect(
        screen.getByText(
          `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('link', { name: 'Home' });
    expect(homeButton).toBeInTheDocument();
  });

  it('toggles the properties so it is either visible or hidden', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Close item properties')).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('Close item properties');

    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByLabelText('Show item properties')).toBeInTheDocument();
    });
  });

  it('toggles the details so it is either visible or hidden', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Close item details')).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('Close item details');

    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByLabelText('Show item details')).toBeInTheDocument();
    });
  });

  it('shows the loading indicator', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
  it('toggles the manufacturer so it is either visible or hidden', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close item manufacturer details')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText(
      'Close item manufacturer details'
    );

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show item manufacturer details')
      ).toBeInTheDocument();
    });
  });

  it('prints when the button is clicked', async () => {
    const spy = jest.spyOn(window, 'print').mockImplementation(() => {});
    createView('/catalogue/item/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: 'Print' });

    await user.click(printButton);
    // Assert that the window.print() function was called
    expect(spy).toHaveBeenCalled();

    // Clean up the mock
    spy.mockRestore();
  });

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Back to Cameras 1 items table view' })
      ).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Back to Cameras 1 items table view',
    });
    expect(url).toHaveAttribute('href', '/catalogue/item/1/items');
  });
});
