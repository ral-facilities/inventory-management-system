import { RenderResult } from '@testing-library/react';
import { UsageStatus } from '../../app.types';
import { renderComponentWithRouterProvider } from '../../testUtils';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import handleIMS_APIError from '../../handleIMS_APIError';
import DeleteUsageStatusDialog, {
  DeleteUsageStatusProps,
} from './deleteUsageStatusDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Unit dialog', () => {
  let props: DeleteUsageStatusProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let usageStatus: UsageStatus;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <DeleteUsageStatusDialog {...props} />
    );
  };

  beforeEach(() => {
    (usageStatus = {
      id: '1',
      value: 'test',
      created_time: '2024-01-01T12:00:00.000+00:00',
      modified_time: '2024-01-02T13:10:10.000+00:00',
    }),
      (props = {
        open: true,
        onClose: onClose,
        usageStatus: usageStatus,
      });
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays warning message when session data is not loaded', async () => {
    props = {
      ...props,
      usageStatus: undefined,
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

  it('calls handleDeleteSession when continue button is clicked with a valid session name', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a unit that is in a Catalogue category', async () => {
    usageStatus.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'The specified usage status is a part of a Item. Please delete the Item first'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    usageStatus.id = '1190';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
