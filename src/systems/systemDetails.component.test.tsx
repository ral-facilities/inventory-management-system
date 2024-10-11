import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { System } from '../api/api.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemDetails, { SystemDetailsProps } from './systemDetails.component';

describe('SystemDetails', () => {
  let props: SystemDetailsProps;
  let mockSystemDetails: System;
  let user: UserEvent;

  const createView = () => {
    if (props.id)
      mockSystemDetails = SystemsJSON.filter(
        (system) => system.id === props.id
      )[0] as System;
    return renderComponentWithRouterProvider(
      <SystemDetails {...props} />,
      'systems'
    );
  };

  beforeEach(() => {
    props = {
      id: '65328f34a40ff5301575a4e3',
    };

    user = userEvent.setup();
  });

  it('renders correctly when no system is selected', async () => {
    props.id = null;

    createView();

    expect(screen.getByText('No system selected')).toBeInTheDocument();
    expect(screen.getByText('Please select a system')).toBeInTheDocument();
  });

  it('renders correctly when a system is selected', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText(mockSystemDetails.name)).toBeInTheDocument();
    });
    expect(screen.queryByText('Please select a system')).toBeFalsy();
    expect(
      screen.getByText(mockSystemDetails.location ?? '')
    ).toBeInTheDocument();
    expect(screen.getByText(mockSystemDetails.owner ?? '')).toBeInTheDocument();
    expect(
      screen.getByText(mockSystemDetails.importance ?? '')
    ).toBeInTheDocument();
    // Can have new line character which breaks normal matching
    expect(
      screen.getByText(
        (_, element) => element?.textContent === mockSystemDetails.description
      )
    ).toBeInTheDocument();

    // Items table
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders correctly when a system is selected and navigate to attachments ', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText(mockSystemDetails.name)).toBeInTheDocument();
    });
    expect(screen.queryByText('Please select a system')).toBeFalsy();
    expect(
      screen.getByText(mockSystemDetails.location ?? '')
    ).toBeInTheDocument();
    expect(screen.getByText(mockSystemDetails.owner ?? '')).toBeInTheDocument();
    expect(
      screen.getByText(mockSystemDetails.importance ?? '')
    ).toBeInTheDocument();
    // Can have new line character which breaks normal matching
    expect(
      screen.getByText(
        (_, element) => element?.textContent === mockSystemDetails.description
      )
    ).toBeInTheDocument();

    // Items table
    expect(screen.getByRole('table')).toBeInTheDocument();
    await user.click(screen.getByText('Attachments'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders correctly when a system is not found', async () => {
    props.id = 'invalid_id';

    createView();

    await waitFor(() => {
      expect(screen.getByText('System not found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'The system you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
      )
    ).toBeInTheDocument();
  });

  it('renders correctly when a system with only required values is selected', async () => {
    props.id = '65328f34a40ff5301575a4e5';
    createView();

    await waitFor(() => {
      expect(screen.getByText(mockSystemDetails.name)).toBeInTheDocument();
    });
    expect(screen.queryByText('Please select a system')).toBeFalsy();
    // One for each of location, owner and description
    expect(await screen.findAllByText('None')).toHaveLength(3);
  });

  it('can open the edit dialog and close it again', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText(mockSystemDetails.name)).toBeInTheDocument();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'actions menu' }));

    await user.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }, 10000);
});
