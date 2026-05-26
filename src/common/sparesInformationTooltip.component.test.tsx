import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import SystemTypesJSON from '../mocks/SystemTypes.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SparesColumnHeaderInformationTooltip,
  SparesInformationTooltipProps,
} from './sparesInformationTooltip.component';

describe('Spares Information Tooltip Component', () => {
  let props: SparesInformationTooltipProps;
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SparesColumnHeaderInformationTooltip {...props} />
    );
  };
  beforeEach(() => {
    props = {
      title: 'Number of spares',
      sparesDefinition: { system_types: [SystemTypesJSON[0]] },
    };

    user = userEvent.setup();
  });

  it('displays tooltip correctly on hover', async () => {
    createView();

    const infoIcon = screen.getByLabelText('Spares Info Tooltip');

    await user.hover(infoIcon);
    await waitFor(() => {
      expect(
        screen.getByText(
          "This value is determined by the location of an item. When an item is in a system with the system type 'Storage' then it is classified as a spare."
        )
      ).toBeInTheDocument();
    });
  });
});
