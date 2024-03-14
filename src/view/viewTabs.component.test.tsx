import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithMemoryRouter } from '../testUtils';
import ViewTabs from './viewTabs.component';

describe('View Tabs', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<ViewTabs />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('lets users switch between tabs', async () => {
    createView('/catalogue');
    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Catalogue'
    );
    const catalogueHomeButton = await screen.findByRole('button', {
      name: 'navigate to catalogue home',
    });
    expect(catalogueHomeButton).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Ims');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Systems');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[2]
    ).toHaveTextContent('Manufacturers');

    await user.click(screen.getByRole('tab', { name: 'Systems' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
    expect(screen.getByText('Root systems')).toBeInTheDocument();
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Ims');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[2]
    ).toHaveTextContent('Manufacturers');

    await user.click(screen.getByRole('tab', { name: 'Manufacturers' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Manufacturers'
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();

    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Ims');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[2]
    ).toHaveTextContent('Systems');
  });

  it('navigates to home page', async () => {
    createView('/');

    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Ims');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[2]
    ).toHaveTextContent('Systems');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[3]
    ).toHaveTextContent('Manufacturers');

    await user.click(screen.getByRole('tab', { name: 'Ims' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Ims'
    );
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Systems');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[2]
    ).toHaveTextContent('Manufacturers');
  });

  it('updates the tab value when url is not default Tab', async () => {
    createView('/systems');

    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
  });
});
