import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  SystemDirectoryDialog,
  SystemDirectoryDialogProps,
} from './systemDirectoryDialog.component';
import axios from 'axios';

describe('SystemDirectoryDialog', () => {
  let props: SystemDirectoryDialogProps;
  let user;
  let axiosPatchSpy;

  const mockOnClose = jest.fn();
  const mockOnChangeSelectedSystems = jest.fn();

  const mockSelectedSystems: System[] = [
    SystemsJSON[4] as System,
    SystemsJSON[5] as System,
  ];

  const createView = () => {
    return renderComponentWithBrowserRouter(
      <SystemDirectoryDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: mockOnClose,
      selectedSystems: mockSelectedSystems,
      onChangeSelectedSystems: mockOnChangeSelectedSystems,
      parentSystemId: null,
    };

    user = userEvent.setup();
    axiosPatchSpy = jest.spyOn(axios, 'patch');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog correctly with multiple selected systems', () => {
    createView();

    expect(
      screen.getByText('Move 2 systems to a different system')
    ).toBeInTheDocument();
  });

  it('renders dialog correctly with one selected system', () => {
    props.selectedSystems = [mockSelectedSystems[0]];

    createView();

    expect(
      screen.getByText('Move 1 system to a different system')
    ).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(axiosPatchSpy).not.toHaveBeenCalled();
    expect(mockOnChangeSelectedSystems).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders the breadcrumbs and navigates correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('link', { name: 'Giant laser' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByText('Giant laser'));

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Smaller laser'));

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();

    // Jump back to home again
    await user.click(screen.getByLabelText('navigate to systems home'));

    await waitFor(() => {
      expect(screen.queryByText('Smaller laser')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Giant laser')).toBeInTheDocument();
  });

  it('starts navigation in the parent when given', async () => {
    props.parentSystemId = '65328f34a40ff5301575a4e4';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
  });

  it('cannot move selected systems to the same system', async () => {
    // Change selected systems to have a parent equal to the target
    props.selectedSystems = [
      SystemsJSON[0] as System,
      SystemsJSON[1] as System,
    ];

    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Move here' })).toBeDisabled();
  });

  it('moves selected systems (to root system)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move here' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/systems/65328f34a40ff5301575a4e7',
      {
        parent_id: null,
      }
    );
    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/systems/65328f34a40ff5301575a4e8',
      {
        parent_id: null,
      }
    );

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith([]);
  });

  it('moves selected systems (to non-root system)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Giant laser'));

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move here' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/systems/65328f34a40ff5301575a4e7',
      {
        parent_id: '65328f34a40ff5301575a4e3',
      }
    );
    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/systems/65328f34a40ff5301575a4e8',
      {
        parent_id: '65328f34a40ff5301575a4e3',
      }
    );

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith([]);
  });
});
