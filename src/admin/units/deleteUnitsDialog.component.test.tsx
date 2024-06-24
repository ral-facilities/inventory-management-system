import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { Unit } from '../../api/api.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import DeleteUnitDialog, {
  DeleteUnitProps,
} from './deleteUnitsDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Unit dialog', () => {
  let props: DeleteUnitProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let unit: Unit;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DeleteUnitDialog {...props} />);
  };

  beforeEach(() => {
    (unit = {
      id: '1',
      value: 'test',
      code: 'test',
      created_time: '2024-01-01T12:00:00.000+00:00',
      modified_time: '2024-01-02T13:10:10.000+00:00',
    }),
      (props = {
        open: true,
        onClose: onClose,
        unit: unit,
      });
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays warning message when session data is not loaded', async () => {
    props = {
      ...props,
      unit: undefined,
    };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText(
      'No data provided. Please refresh and try again'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/v1/units/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls handleDeleteSession when continue button is clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a unit that is in a Catalogue category', async () => {
    unit.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'This unit is currently used by one or more catalogue categories. Remove all uses before deleting it here.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    unit.id = '1190';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
