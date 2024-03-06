import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatalogueItem } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { renderComponentWithBrowserRouter } from '../../testUtils';
import DeleteCatalogueItemDialog, {
  DeleteCatalogueItemDialogProps,
} from './deleteCatalogueItemDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Catalogue Category dialogue', () => {
  let props: DeleteCatalogueItemDialogProps;
  let user;
  const onClose = vi.fn();
  const onChangeCatalogueItem = vi.fn();
  let catalogueItem: CatalogueItem;

  const createView = (): RenderResult => {
    return renderComponentWithBrowserRouter(
      <DeleteCatalogueItemDialog {...props} />
    );
  };

  beforeEach(() => {
    catalogueItem = {
      name: 'test',
      id: '1',
      catalogue_category_id: '3',
      description: '',
      properties: [],
    };
    props = {
      open: true,
      onClose: onClose,
      catalogueItem: catalogueItem,
      onChangeCatalogueItem: onChangeCatalogueItem,
    };
    user = userEvent; // Assigning userEvent to 'user'
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Catalogue Item')).toBeInTheDocument();
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
      catalogueItem: undefined,
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
  });

  it('displays error message when user tries to delete a catalogue category that has children elements', async () => {
    catalogueItem.id = '6';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Catalogue item has child elements and cannot be deleted, please delete the children elements first'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    catalogueItem.id = '1190';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
