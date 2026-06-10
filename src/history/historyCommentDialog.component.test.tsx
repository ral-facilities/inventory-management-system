import { fireEvent, screen } from '@testing-library/react';
import { renderComponentWithRouterProvider } from '../testUtils';
import HistoryCommentDialog, {
  HistoryCommentProps,
} from './historyCommentDialog.component';
import userEvent, { UserEvent } from '@testing-library/user-event';

describe('HistoryCommentDialog', () => {
  let props: HistoryCommentProps;
  let user: UserEvent;
  const mockOnSubmit = vi.fn();
  const mockOnChange = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <HistoryCommentDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onSubmit: mockOnSubmit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: mockOnChange as any, // could not resolve types between mock and UseFormRegisterReturn
      action: 'editing',
      entityTypeName: 'Item',
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly (editing single item)', async () => {
    createView();

    expect(
      screen.getByText('Please add a comment to justify editing this Item')
    );
    expect(screen.getByLabelText('Comment')).toHaveTextContent('');
  });

  it('renders correctly (moving multiple items)', async () => {
    props.action = 'moving';
    props.entityTypeName = 'Items';
    createView();

    expect(
      screen.getByText('Please add a comment to justify moving these Items')
    );
    expect(screen.getByLabelText('Comment')).toHaveTextContent('');
  });

  it('calls onSubmit when submit button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(props.onSubmit).toHaveBeenCalled();
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(props.onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('user can add a comment', async () => {
    createView();
    expect(
      screen.getByText('Please add a comment to justify editing this Item')
    );

    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'A test comment' },
    });

    expect(screen.getByDisplayValue('A test comment'));
  });
});
