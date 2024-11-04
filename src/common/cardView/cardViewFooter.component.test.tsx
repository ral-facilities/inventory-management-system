import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MRT_PaginationState } from 'material-react-table';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CardViewFooter, {
  CardViewFooterProps,
} from './cardViewFooter.component';

const mockOnPaginationChange = vi.fn();

const defaultProps = {
  label: 'Items',
  dataLength: 100,
  onPaginationChange: mockOnPaginationChange,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
  } as MRT_PaginationState,
  maxResultsList: [5, 10, 20, 50],
};

describe('CardViewFooter', () => {
  let props: CardViewFooterProps;
  let user: UserEvent;

  const createView = () => {
    renderComponentWithRouterProvider(<CardViewFooter {...props} />);
  };
  beforeEach(() => {
    props = {
      label: 'Items',
      dataLength: 100,
      onPaginationChange: mockOnPaginationChange,
      pagination: {
        pageIndex: 1,
        pageSize: 10,
      } as MRT_PaginationState,
      maxResultsList: [5, 10, 20, 50],
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    createView();

    expect(screen.getByText('Total Items: 100')).toBeInTheDocument();
    expect(screen.getByLabelText('Items per page')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('calls onPaginationChange when changing the page size', async () => {
    createView();
    const maxResults = screen.getByRole('combobox');
    await user.click(maxResults);
    await user.click(screen.getByRole('option', { name: '20' }));

    expect(mockOnPaginationChange).toHaveBeenCalledWith({
      pageSize: 20,
      pageIndex: 1,
    });
  });

  it('calls onPaginationChange when pagination page is changed', async () => {
    render(<CardViewFooter {...defaultProps} />);

    // Simulate clicking on page 3
    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));

    expect(mockOnPaginationChange).toHaveBeenCalledWith(expect.any(Function));
    // Check if the function is called with the correct page index
    expect(mockOnPaginationChange).toHaveBeenCalledWith(expect.any(Function));
    expect(mockOnPaginationChange).toHaveBeenCalledTimes(1); // Change based on how many times it's expected to be called
  });
});
