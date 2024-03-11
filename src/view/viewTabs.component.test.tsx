import React from 'react';
import { renderComponentWithRouterProvider } from '../setupTests';
import ViewTabs from './viewTabs.component';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('View Tabs', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<ViewTabs />, path);
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
    ).toHaveTextContent('Systems');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Manufacturers');

    await user.click(screen.getByRole('tab', { name: 'Systems' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
    expect(screen.getByText('Root systems')).toBeInTheDocument();
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
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
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Systems');
  });

  it('navigates to home page', async () => {
    createView('/ims');

    await waitFor(() => {
      expect(screen.getAllByText('Inventory Managment')[0]).toBeInTheDocument();
    });

    createView('/');

    await waitFor(() => {
      expect(screen.getAllByText('Inventory Managment')[0]).toBeInTheDocument();
    });
  });

  it('updates the tab value when url is not default Tab', async () => {
    createView('/systems');

    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
  });
});
