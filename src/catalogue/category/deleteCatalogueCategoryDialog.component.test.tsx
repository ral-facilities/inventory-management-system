import React from 'react';
import { screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteCatalogueCategoryDialog, {
  DeleteCatalogueCategorDialogProps,
} from './deleteCatalogueCategoryDialog.component';
import { renderComponentWithBrowserRouter } from '../../setupTests';

describe('delete Catalogue Category dialogue', () => {
  let props: DeleteCatalogueCategorDialogProps;
  let user;
  const onClose = jest.fn();
  const refetchData = jest.fn();

  const createView = (): RenderResult => {
    return renderComponentWithBrowserRouter(
      <DeleteCatalogueCategoryDialog {...props} />
    );
  };
  const catalogueCategory = {
    name: 'test',
    parent_id: null,
    id: '1',
    code: 'test',
    path: '/test',
    parent_path: '/',
    is_leaf: false,
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      refetchData: refetchData,
      catalogueCategory: catalogueCategory,
    };
    user = userEvent; // Assigning userEvent to 'user'
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Catalogue Category')).toBeInTheDocument();
    expect(
      screen.getByTestId('delete-catalogue-category-name')
    ).toHaveTextContent('test');
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
    props = {
      ...props,
      catalogueCategory: undefined,
    };
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
    expect(refetchData).toHaveBeenCalled();
  });
});
