import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Manufacturer from './manufacturer.component';
import userEvent from '@testing-library/user-event';
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));
describe('Manufacturer', () => {
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(<Manufacturer />);
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table headers correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Telephone number')).toBeInTheDocument();
  });

  it('renders table data correctly', async () => {
    const view = createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    //also unhide created column
    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    await user.click(screen.getByText('Created'));
    expect(view.asFragment()).toMatchSnapshot();
  }, 10000);

  it('manufacturer url has a href so therefore links to new webpage', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });
    const url = await screen.findByText('http://example.com');
    expect(url).toHaveAttribute('href', 'http://example.com');
  });

  it('opens delete dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Delete'));

    expect(screen.getByText('Delete Manufacturer')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete Manufacturer')).not.toBeInTheDocument();
    });
  });

  it('opens edit dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Manufacturer')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Manufacturer')).not.toBeInTheDocument();
    });
  });

  it('opens add dialog and closes it correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add Manufacturer' }));

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);
  });

  it('sets the table filters and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Filter by Name');

    await user.type(nameInput, 'B');

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });
  }, 10000);

  it('navigates back to the root directory', async () => {
    createView();

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to manufacturer home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/manufacturer');
  });
});
