import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import MRTTopTableAlert, {
  MRTTopTableAlertProps,
} from './mrtTopTableAlert.component';

describe('MRTTopTableAlert', () => {
  let props: MRTTopTableAlertProps;
  let user: UserEvent;
  const clearFilters = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<MRTTopTableAlert {...props} />);
  };

  beforeEach(() => {
    props = {
      title: 'test',
      clearFilters,
      clearFiltersAriaLabel: 'Clear test filter',
      showInfoTooltip: true,
      infoTooltipTitle: 'test',
    };
    user = userEvent.setup();
  });

  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('calls the clear filters function when the clear filters button is clicked', async () => {
    createView();
    await user.click(
      await screen.findByRole('button', { name: 'Clear test filter' })
    );

    expect(clearFilters).toBeCalled();
  });
});
