import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import Items from './items.component';
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
describe('Items', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<Items />, path);
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders correctly', async () => {
    const view = createView('/catalogue/item/1/items');
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Back to Cameras table view' })
      ).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Back to Cameras table view',
    });
    expect(url).toHaveAttribute('href', '/catalogue/4');
  });

  it('navigates to catalogue item landing page', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Back to Cameras 1 landing page' })
      ).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Back to Cameras 1 landing page',
    });
    expect(url).toHaveAttribute('href', '/catalogue/item/1');
  });

  it('opens and closes the add item dialog', async () => {
    createView('/catalogue/item/1/items');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Item' })
      ).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', {
      name: 'Add Item',
    });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
