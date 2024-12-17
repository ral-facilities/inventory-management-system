import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { MockInstance, vi } from 'vitest';
import { imsApi } from '../api/api';
import { renderComponentWithRouterProvider } from '../testUtils';
import SparesDefinitionDialog, {
  SparesDefinitionDialogProps,
} from './sparesDefinitionDialog.component';

describe('SparesDefinitionDialog Component', () => {
  let props: SparesDefinitionDialogProps;
  let user: UserEvent;
  let axiosPutSpy: MockInstance;

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SparesDefinitionDialog {...props} />
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      open: true,
      onClose: onClose,
    };

    axiosPutSpy = vi.spyOn(imsApi, 'put');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when opened', async () => {
    createView();

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('disables save button when checkbox is not checked', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    const checkbox = screen.getByLabelText(
      'Confirm understanding and proceed checkbox'
    );

    expect(saveButton).toBeDisabled();

    await user.click(checkbox);
    expect(saveButton).toBeEnabled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    createView();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should modify spares definition', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    const checkbox = screen.getByLabelText(
      'Confirm understanding and proceed checkbox'
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Scrapped' }));
    await user.click(checkbox);

    await user.click(saveButton);

    expect(axiosPutSpy).toHaveBeenCalledWith('/v1/settings/spares_definition', {
      usage_statuses: [
        {
          id: '0',
        },
        {
          id: '2',
        },
        {
          id: '3',
        },
      ],
    });
  });

  it('displays error message if spares definition has not changed and clears when value is changed', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    const checkbox = screen.getByLabelText(
      'Confirm understanding and proceed checkbox'
    );

    await user.click(checkbox);

    await user.click(saveButton);

    expect(
      screen.getByText(
        'No changes detected in the spares definition. Please update the spares definition or select Cancel to exit.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Scrapped' }));

    expect(
      screen.queryByText(
        'No changes detected in the spares definition. Please update the spares definition or select Cancel to exit.'
      )
    ).not.toBeInTheDocument();
  });

  it('displays error message if spares definition has less then 1 usage status and clears when value is changed', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    const checkbox = screen.getByLabelText(
      'Confirm understanding and proceed checkbox'
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Used' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'New' }));

    await user.click(checkbox);
    await user.click(saveButton);

    expect(
      screen.getByText(
        'The list must have at least one item. Please add a usage status.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Scrapped' }));

    expect(
      screen.queryByText(
        'The list must have at least one item. Please add a usage status.'
      )
    ).not.toBeInTheDocument();
  });
});
