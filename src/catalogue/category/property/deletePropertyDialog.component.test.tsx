import {
  RenderResult,
  act,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { CatalogueCategory } from '../../../api/api.types';
import { AddCatalogueCategoryPropertyWithPlacementIds } from '../../../app.types';
import handleIMS_APIError from '../../../handleIMS_APIError';
import { server } from '../../../mocks/server';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../../testUtils';
import { transformToAddCatalogueCategoryWithPlacementIds } from '../catalogueCategoryDialog.component';
import DeletePropertyDialog, {
  DeletePropertyDialogProps,
} from './deletePropertyDialog.component';

vi.mock('../../../handleIMS_APIError');

describe('delete property dialog', () => {
  let props: DeletePropertyDialogProps;
  let user: UserEvent;
  const onClose = vi.fn();

  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeletePropertyDialog {...props} />
    );
  };

  const catalogueCategory = getCatalogueCategoryById('12') as CatalogueCategory;

  const formattedProperties = transformToAddCatalogueCategoryWithPlacementIds(
    catalogueCategory
  ).properties as AddCatalogueCategoryPropertyWithPlacementIds[];

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      catalogueCategory: catalogueCategory,
      selectedProperty: formattedProperties[0],
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with tooltip', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Property as Admin')).toBeInTheDocument();
    });

    const infoIcon = screen.getByTestId('admin-status-tooltip');

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText('As an admin, you can delete properties')
      ).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete(
        '/v1/catalogue-categories/:catalogue_category_id/properties/:property_id',
        () => {
          return new Promise(() => {});
        }
      )
    );

    createView();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );

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

  it('calls handleDeleteSession when continue button is clicked with', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    expect(continueButton).toBeDisabled();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );

    expect(continueButton).not.toBeDisabled();

    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    props.catalogueCategory!.id = 'Error 500';

    createView();
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
