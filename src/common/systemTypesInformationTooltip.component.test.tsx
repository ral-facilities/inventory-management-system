import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import SystemTypesJSON from '../mocks/SystemTypes.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SystemTypeColumnHeaderInformationTooltip,
  SystemTypeInformationTooltipProps,
} from './systemTypesInformationTooltip.component';

describe('System Type Information Tooltip Component', () => {
  let props: SystemTypeInformationTooltipProps;
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SystemTypeColumnHeaderInformationTooltip {...props} />
    );
  };
  beforeEach(() => {
    props = {
      title: 'Types',
      systemTypesData: SystemTypesJSON,
    };

    user = userEvent.setup();
  });

  it('displays tooltip correctly on hover', async () => {
    createView();

    const infoIcon = screen.getByLabelText('System Type Info Tooltip');

    await user.hover(infoIcon);
    await waitFor(() => {
      expect(
        screen.getByText(
          'Storage: Storage system type Operational: Operational system type Scrapped: Scrapped system type'
        )
      ).toBeInTheDocument();
    });

    await user.unhover(infoIcon);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Storage: Storage system type Operational: Operational system type Scrapped: Scrapped system type'
        )
      ).not.toBeInTheDocument();
    });
  });
});
