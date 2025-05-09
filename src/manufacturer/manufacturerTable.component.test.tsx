import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import ManufacturerTable from './manufacturerTable.component';

describe('Manufacturer Table', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<ManufacturerTable />);
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
  });

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

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

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

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

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

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
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
});
