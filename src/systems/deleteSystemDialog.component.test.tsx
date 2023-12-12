import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { System, SystemImportanceType } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  DeleteSystemDialog,
  DeleteSystemDialogProps,
} from './deleteSystemDialog.component';

describe('DeleteSystemDialog', () => {
  let props: DeleteSystemDialogProps;
  let user;
  let axiosDeleteSpy;

  const createView = () => {
    // Load whatever system is requested (only assign if found to avoid errors
    // when rendering while testing a 404 error)
    const system = SystemsJSON.filter(
      (system) => system.id === props.system.id
    )[0] as System;
    if (system) props.system = system;

    return renderComponentWithBrowserRouter(<DeleteSystemDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: jest.fn(),
      // This system data is just a placeholder until the actual data is loaded
      // in createView
      system: {
        id: '65328f34a40ff5301575a4e9',
        name: '',
        description: null,
        location: null,
        owner: null,
        importance: SystemImportanceType.LOW,
        parent_id: null,
        code: '',
      },
    };
    user = userEvent.setup();
    axiosDeleteSpy = jest.spyOn(axios, 'delete');
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('sends a delete request, closes the dialog and navigates to the parent system when continue button is clicked with a valid system', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(axiosDeleteSpy).toHaveBeenCalledWith(
      `/v1/systems/${props.system.id}`
    );
    expect(props.onClose).toHaveBeenCalled();
    expect(window.location.pathname).toBe(`/systems/${props.system.parent_id}`);
  });

  it('displays error message when deleting a system with children', async () => {
    props.system.id = '65328f34a40ff5301575a4e3';

    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        )
      ).toBeInTheDocument();
    });

    expect(axiosDeleteSpy).toHaveBeenCalledWith(
      `/v1/systems/${props.system.id}`
    );
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('displays error message when an unknown error occurs', async () => {
    props.system.id = 'invalid_id';

    createView();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
    });

    expect(axiosDeleteSpy).toHaveBeenCalledWith(
      `/v1/systems/${props.system.id}`
    );
    expect(props.onClose).not.toHaveBeenCalled();
  });
});
