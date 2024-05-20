import userEvent, { UserEvent } from '@testing-library/user-event';
import { imsApi } from '../../api/api';
import { renderComponentWithRouterProvider } from '../../testUtils';

import { fireEvent, screen } from '@testing-library/react';
import UsageStatusDialog, {
  UsageStatusDialogProps,
} from './usageStatusDialog.component';

describe('Units dialog', () => {
  let props: UsageStatusDialogProps;
  let user: UserEvent;
  let axiosPostSpy;
  const onClose = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(<UsageStatusDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
    };
    user = userEvent.setup();

    axiosPostSpy = vi.spyOn(imsApi, 'post');
  });

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByLabelText('Value *')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows errors correctly', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    const helperTexts = screen.getByText('Please enter a value');
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Value *'), {
      target: { value: 'test_dup' },
    });

    await user.click(saveButton);
    const helperText = screen.getByText(
      'A usage status with the same name already exists'
    );
    expect(helperText).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('adds a usage status', async () => {
    createView();

    fireEvent.change(screen.getByLabelText('Value *'), {
      target: { value: 'test' },
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/usage-statuses', {
      value: 'test',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
