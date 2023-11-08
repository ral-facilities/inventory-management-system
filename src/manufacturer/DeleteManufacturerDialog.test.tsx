import React from 'react';
import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { DeleteManufacturerProps } from './deleteManufacturerDialog.component';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import { Manufacturer } from '../app.types';

describe('Delete Manufacturer Dialog', () => {
  const onClose = jest.fn();
  let props: DeleteManufacturerProps;
  let manufacturer: Manufacturer;
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
