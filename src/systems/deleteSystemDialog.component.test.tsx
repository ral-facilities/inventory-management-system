import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../api/api';
import { System, SystemImportanceType } from '../api/api.types';
import handleIMS_APIError from '../handleIMS_APIError';
import SystemsJSON from '../mocks/Systems.json';
import { server } from '../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../testUtils';
import {
  DeleteSystemDialog,
  DeleteSystemDialogProps,
} from './deleteSystemDialog.component';

vi.mock('../handleIMS_APIError');

describe('DeleteSystemDialog', () => {
  let systemId = '';
  let props: DeleteSystemDialogProps;
  let user: UserEvent;
  let axiosDeleteSpy: MockInstance;

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
        ...CREATED_MODIFIED_TIME_VALUES,
      };

    return renderComponentWithRouterProvider(<DeleteSystemDialog {...props} />);
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

  it('disables finish button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/v1/systems/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onClose).toHaveBeenCalled();
    expect(axiosDeleteSpy).not.toHaveBeenCalled();
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(props.onClose).not.toHaveBeenCalled();
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
