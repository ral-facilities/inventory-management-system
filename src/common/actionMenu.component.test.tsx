import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderComponentWithRouterProvider } from '../testUtils';
import ActionMenu, { ActionMenuProps } from './actionMenu.component';

describe('ActionMenu Component', () => {
  let props: ActionMenuProps;
  let user: UserEvent;
  const mockEditMenuItem = {
    onClick: vi.fn(),
    dialog: <div data-testid="edit-dialog">Edit Dialog</div>,
  };

  const createView = () => {
    renderComponentWithRouterProvider(<ActionMenu {...props} />);
  };

  beforeEach(() => {
    props = {
      ariaLabelPrefix: 'catalogue items landing page',
      uploadAttachmentsEntityId: '1',
      uploadImagesEntityId: '1',
      editMenuItem: mockEditMenuItem,
      printMenuItem: true,
    };
    user = userEvent.setup();
    // Mock the window.print function
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ActionMenu and allows menu interaction', async () => {
    createView();

    // Verify that "Actions" text is displayed
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Verify the menu button is rendered
    const actionButton = screen.getByLabelText(
      'catalogue items landing page actions menu'
    );
    expect(actionButton).toBeInTheDocument();

    // Open the menu
    await user.click(actionButton);

    // Check if the "Edit" option is visible
    expect(screen.getByText('Edit')).toBeVisible();

    // Check if the "Print" option is visible
    expect(screen.getByText('Print')).toBeVisible();
  });

  it('triggers edit action and closes menu on clicking Edit', async () => {
    createView();

    // Open the menu
    const actionButton = screen.getByLabelText(
      'catalogue items landing page actions menu'
    );
    await user.click(actionButton);

    // Click on the "Edit" option
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // Verify that the mock edit function was called
    expect(mockEditMenuItem.onClick).toHaveBeenCalled();

    // Check if the dialog is displayed
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
  });

  it('triggers window print and closes menu on clicking Print', async () => {
    createView();

    // Open the menu
    const actionButton = screen.getByLabelText(
      'catalogue items landing page actions menu'
    );
    await user.click(actionButton);

    // Click on the "Print" option
    const printButton = screen.getByText('Print');
    await user.click(printButton);

    // Verify that window.print was called
    expect(window.print).toHaveBeenCalled();
  });

  it('opens the upload attachment dialog', async () => {
    createView();

    // Open the menu
    const actionButton = screen.getByLabelText(
      'catalogue items landing page actions menu'
    );
    await user.click(actionButton);

    const editButton = screen.getByText('Upload Attachments');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close Modal' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('opens the upload images dialog', async () => {
    createView();

    // Open the menu
    const actionButton = screen.getByLabelText(
      'catalogue items landing page actions menu'
    );
    await user.click(actionButton);

    const editButton = screen.getByText('Upload Images');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
