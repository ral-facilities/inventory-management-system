import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { CatalogueCategory } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { renderComponentWithRouterProvider } from '../../testUtils';
import DeleteCatalogueCategoryDialog, {
  DeleteCatalogueCategoryDialogProps,
} from './deleteCatalogueCategoryDialog.component';
import { paths } from '../../view/viewTabs.component';

vi.mock('../../handleIMS_APIError');

describe('delete Catalogue Category dialogue', () => {
  let props: DeleteCatalogueCategoryDialogProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onChangeCatalogueCategory = vi.fn();
  let catalogueCategory: CatalogueCategory;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeleteCatalogueCategoryDialog {...props} />,
      paths.catalogue
    );
  };

  beforeEach(() => {
    catalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
    };
    props = {
      open: true,
      onClose: onClose,
      catalogueCategory: catalogueCategory,
      onChangeCatalogueCategory: onChangeCatalogueCategory,
    };
    user = userEvent.setup(); // Assigning userEvent to 'user'
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a catalogue category that has children elements', async () => {
    catalogueCategory.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Catalogue category has children elements and cannot be deleted, please delete the children elements first'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    catalogueCategory.id = '1190';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
