import {
  RenderResult,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { CatalogueCategory } from '../../api/api.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import DeleteCatalogueCategoryDialog, {
  DeleteCatalogueCategoryDialogProps,
} from './deleteCatalogueCategoryDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Catalogue Category dialogue', () => {
  let props: DeleteCatalogueCategoryDialogProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onChangeCatalogueCategory = vi.fn();
  let catalogueCategory: CatalogueCategory;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeleteCatalogueCategoryDialog {...props} />
    );
  };

  beforeEach(() => {
    catalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
      properties: [],
      ...CREATED_MODIFIED_TIME_VALUES,
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

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/v1/catalogue-categories/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    expect(onClose).toHaveBeenCalledWith({
      successfulDeletion: false,
    });
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(onClose).not.toHaveBeenCalled();
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

  it('calls handleDeleteSession when continue button is clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    expect(onClose).toHaveBeenCalledWith({
      successfulDeletion: true,
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
