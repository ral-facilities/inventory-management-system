import React from 'react';
import { screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteItemDialog, {
  DeleteItemDialogProps,
} from './deleteItemDialog.component';
import {
  getItemById,
  getItemsByCatalogueItemId,
  renderComponentWithBrowserRouter,
} from '../setupTests';
import { Item } from '../app.types';

describe('delete item dialog', () => {
  let props: DeleteItemDialogProps;
  let user;
  const onClose = jest.fn();
  const onChangeItem = jest.fn();
  let item: Item | undefined;

  const createView = (): RenderResult => {
    return renderComponentWithBrowserRouter(<DeleteItemDialog {...props} />);
  };

  beforeEach(() => {
    item = getItemById('KvT2Ox7n');
    props = {
      open: true,
      onClose: onClose,
      item: item,
      onChangeItem: onChangeItem,
    };
    user = userEvent; // Assigning userEvent to 'user'
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByTestId('delete-item-KvT2Ox7n')).toHaveTextContent(
      'ID: KvT2Ox7n'
    );
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays warning message when session data is not loaded', async () => {
    props.item = undefined;

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText(
      'No data provided, Please refresh and try again'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls handleDeleteSession when continue button is clicked with a valid session name', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    if (item) item.id = 'Error 500';

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
    });
  });
});
