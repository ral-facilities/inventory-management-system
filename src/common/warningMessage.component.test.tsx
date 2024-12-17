import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import WarningMessage, {
  WarningMessageProps,
} from './warningMessage.component';

describe('WarningMessage Component', () => {
  let props: WarningMessageProps;
  let user: UserEvent;
  const setIsChecked = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<WarningMessage {...props} />);
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      isChecked: false,
      setIsChecked: setIsChecked,
      message:
        'Warning: Saving these changes will trigger updates to all catalog items, which may cause requests on the items to be denied and slow down the system.',
    };
  });

  describe('when not checked', () => {
    it('renders correctly with unchecked state', async () => {
      createView();

      let baseElement;
      await act(async () => {
        baseElement = createView().baseElement;
      });
      expect(baseElement).toMatchSnapshot();
    });

    it('checkbox state can be toggled', async () => {
      createView();
      const checkbox = screen.getByLabelText(
        'Confirm understanding and proceed checkbox'
      );

      await user.click(checkbox);
      expect(setIsChecked).toHaveBeenCalledWith(true);
    });
  });

  describe('when checked', () => {
    beforeEach(() => {
      props.isChecked = true;
    });

    it('renders correctly with checked state', async () => {
      createView();

      let baseElement;
      await act(async () => {
        baseElement = createView().baseElement;
      });
      expect(baseElement).toMatchSnapshot();
    });

    it('checkbox state can be toggled', async () => {
      createView();
      const checkbox = screen.getByLabelText(
        'Confirm understanding and proceed checkbox'
      );

      await user.click(checkbox);
      expect(setIsChecked).toHaveBeenCalledWith(false);
    });
  });
});
