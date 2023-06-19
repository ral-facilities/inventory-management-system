import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import ViewTabs from './viewTabs.component';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('View Tabs', () => {
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<ViewTabs />, path);
  };

  it('lets users switch between tabs', async () => {
    const user = userEvent.setup();
    createView('/');
    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Catalogue'
    );
    expect(screen.getByText('Catalogue Page')).toBeInTheDocument();
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Systems');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Manufacturer');

    await user.click(screen.getByRole('tab', { name: 'Systems' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
    expect(screen.getByText('Systems Page')).toBeInTheDocument();
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Manufacturer');

    await user.click(screen.getByRole('tab', { name: 'Manufacturer' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Manufacturer'
    );
    expect(screen.getByText('Manufacturer Page')).toBeInTheDocument();
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[0]
    ).toHaveTextContent('Catalogue');
    expect(
      viewTabs.getAllByRole('tab', { selected: false })[1]
    ).toHaveTextContent('Systems');
  });

  it('updates the tab value when url is not default Tab', async () => {
    createView('/systems');

    const viewTabs = within(screen.getByRole('tablist', { name: 'view tabs' }));

    expect(viewTabs.getByRole('tab', { selected: true })).toHaveTextContent(
      'Systems'
    );
  });
});
