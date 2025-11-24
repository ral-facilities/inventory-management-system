import { fireEvent, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import UnitsDialog, { UnitsDialogProps } from './unitsDialog.component';

describe('Units dialog', () => {
  let props: UnitsDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  const onClose = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(<UnitsDialog {...props} />);
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
    const helperTexts = screen.getByText('Please enter a value.');
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Value *'), {
      target: { value: 'test_dup' },
    });

    await user.click(saveButton);
    const helperText = screen.getByText(
      'A unit with the same value already exists. Please enter a different value.'
    );
    expect(helperText).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables save button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.post('/v1/units', () => {
        return new Promise(() => {});
      })
    );

    createView();

    fireEvent.change(screen.getByLabelText('Value *'), {
      target: { value: 'test' },
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('adds a unit', async () => {
    createView();

    fireEvent.change(screen.getByLabelText('Value *'), {
      target: { value: 'test' },
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/units', {
      value: 'test',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
