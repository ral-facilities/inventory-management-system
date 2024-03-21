import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Manufacturer } from '../app.types';
import handleIMS_APIError from '../handleIMS_APIError';
import { renderComponentWithRouterProvider } from '../testUtils';
import DeleteManufacturerDialog, {
  DeleteManufacturerProps,
} from './deleteManufacturerDialog.component';
import { paths } from '../view/viewTabs.component';

vi.mock('../handleIMS_APIError');

describe('Delete Manufacturer Dialog', () => {
  const onClose = vi.fn();
  let props: DeleteManufacturerProps;
  let manufacturer: Manufacturer;
  let user: UserEvent;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeleteManufacturerDialog {...props} />,
      paths.manufacturers
    );
  };
  beforeEach(() => {
    manufacturer = {
      name: 'test',
      url: 'http://example.com',
      address: {
        address_line: '1 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      },
      telephone: '056896598',
      id: '1',
    };
    props = {
      open: true,
      onClose: onClose,
      manufacturer: manufacturer,
    };
    user = userEvent;
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog correctly', async () => {
    createView();
    expect(screen.getByText('Delete Manufacturer')).toBeInTheDocument();
    expect(screen.getByTestId('delete-manufacturer-name')).toHaveTextContent(
      'test'
    );
  });

  it('calls onClose when Close clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays warning message when data not loaded', async () => {
    props = {
      ...props,
      manufacturer: undefined,
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

  it('calls handleDelete when Continue clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a manufacturer that is a part of a catalogue item', async () => {
    manufacturer.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'The specified manufacturer is a part of a Catalogue Item. Please delete the Catalogue Item first.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    manufacturer.id = '100';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
