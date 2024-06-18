import {
  RenderResult,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { CatalogueItem } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import DeleteCatalogueItemDialog, {
  DeleteCatalogueItemDialogProps,
} from './deleteCatalogueItemDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Catalogue Category dialogue', () => {
  let props: DeleteCatalogueItemDialogProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onChangeCatalogueItem = vi.fn();
  let catalogueItem: CatalogueItem;

  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeleteCatalogueItemDialog {...props} />
    );
  };

  beforeEach(() => {
    catalogueItem = {
      name: 'test',
      id: '1',
      catalogue_category_id: '3',
      description: '',
      cost_gbp: 0,
      cost_to_rework_gbp: null,
      days_to_replace: 0,
      days_to_rework: null,
      drawing_link: null,
      drawing_number: null,
      notes: null,
      is_obsolete: false,
      item_model_number: null,
      manufacturer_id: '1',
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
      properties: [],
      ...CREATED_MODIFIED_TIME_VALUES,
    };
    props = {
      open: true,
      onClose: onClose,
      catalogueItem: catalogueItem,
      onChangeCatalogueItem: onChangeCatalogueItem,
    };
    user = userEvent.setup();
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

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/v1/catalogue-items/:id', () => {
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

  it('calls handleDeleteSession when continue button is clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a catalogue category that has children elements', async () => {
    catalogueItem.id = '6';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

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
