import React from 'react';
import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { DeleteManufacturerProps } from './deleteManufacturerDialog.component';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import { ViewManufacturerResponse } from '../app.types';

describe('Delete Manufacturer Dialog', () => {
  const onClose = jest.fn();
  const refetchData = jest.fn();
  let props: DeleteManufacturerProps;
  let manufacturer: ViewManufacturerResponse;
  let user;
  const createView = (): RenderResult => {
    return renderComponentWithBrowserRouter(
      <DeleteManufacturerDialog {...props} />
    );
  };
  beforeEach(() => {
    manufacturer = {
      name: 'test',
      url: 'http://example.com',
      address: {
        building_number: '1',
        street_name: 'Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postCode: 'OX1 2AB',
      },
      telephone: '056896598',
      id: '1',
    };
    props = {
      open: true,
      onClose: onClose,
      refetchData: refetchData,
      manufacturer: manufacturer,
    };
    user = userEvent;
  });
  afterEach(() => {
    jest.clearAllMocks();
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
    user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(refetchData).toHaveBeenCalled();
  });

  it('displays error message when user tries to delete a manufacturer that is a part of a catalogue item', async () => {
    manufacturer.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'The manufacturer is a part of a Catalogue Item, Please delete the Catalogue Item first Please delete the Catalogue Item first'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    manufacturer.id = '100';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
    });
  });
});
