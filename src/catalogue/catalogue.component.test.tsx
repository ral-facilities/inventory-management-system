import React from 'react';
import {
  renderComponentWithBrowserRouter,
  renderComponentWithMemoryRouter,
} from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Catalogue from './catalogue.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue', () => {
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(<Catalogue />);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders text correctly', () => {
    createView();
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });
  it('navigates back to the root directory', async () => {
    createView();

    const homeButton = await screen.findByTestId('home-button-catalogue');
    await user.click(homeButton);
    expect(window.location.pathname).toBe('/catalogue');
  });
  it('opens the add catalogue category dialog', async () => {
    createView();

    const addButton = await screen.findByTestId('add-button-catalogue');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('renders the breadcumbs and navigate to another directory', async () => {
    renderComponentWithMemoryRouter(
      <Catalogue />,
      '/catalogue/motion/actuators'
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'motion' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: 'motion' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'motion' })
      ).not.toBeInTheDocument();
    });
  });
});
