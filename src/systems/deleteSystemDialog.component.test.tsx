import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { System, SystemImportanceType } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  DeleteSystemDialog,
  DeleteSystemDialogProps,
} from './deleteSystemDialog.component';
import handleIMS_APIError from '../handleIMS_APIError';
import { imsApi } from '../api/api';

jest.mock('../handleIMS_APIError');

describe('DeleteSystemDialog', () => {
  let systemId = '';
  let props: DeleteSystemDialogProps;
  let user;
  let axiosDeleteSpy;

  const createView = () => {
    // Load whatever system is requested (only assign if found to avoid errors
    // when rendering while testing a 404 error)
    const system = SystemsJSON.filter(
      (system) => system.id === systemId
    )[0] as System;
    if (system) props.system = system;
    else if (systemId === 'invalid_id')
      props.system = {
        id: systemId,
        name: '',
        description: null,
        location: null,
        owner: null,
        importance: SystemImportanceType.LOW,
        parent_id: null,
        code: '',
      };

    return renderComponentWithBrowserRouter(<DeleteSystemDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: vi.fn(),
      system: undefined,
    };
    systemId = '65328f34a40ff5301575a4e9';
    user = userEvent.setup();
    axiosDeleteSpy = vi.spyOn(imsApi, 'delete');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    createView();

    expect(screen.getByText('Delete System')).toBeInTheDocument();
    expect(screen.getByTestId('delete-system-name')).toHaveTextContent(
      'Plasma Beam'
    );
  });

  it('calls onClose when cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onClose).toHaveBeenCalled();
    expect(axiosDeleteSpy).not.toHaveBeenCalled();
  });

  it('sends a delete request and closes the dialog when continue button is clicked with a valid system', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(axiosDeleteSpy).toHaveBeenCalledWith(`/v1/systems/${systemId}`);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('displays error message when deleting a system with children', async () => {
    systemId = '65328f34a40ff5301575a4e3';

    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        )
      ).toBeInTheDocument();
    });

    expect(axiosDeleteSpy).toHaveBeenCalledWith(`/v1/systems/${systemId}`);
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('displays error message when an unknown error occurs', async () => {
    systemId = 'invalid_id';

    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(handleIMS_APIError).toHaveBeenCalled();
    expect(axiosDeleteSpy).toHaveBeenCalledWith(`/v1/systems/${systemId}`);
    expect(props.onClose).not.toHaveBeenCalled();
  });
});
