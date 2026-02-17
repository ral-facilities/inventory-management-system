import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
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
      sparesDefinition: undefined,
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
          'The spares values is determined by the location of an item. Currently there is no spares definition.'
        )
      ).toBeInTheDocument();
    });
  });
});
