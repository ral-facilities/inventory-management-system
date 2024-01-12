import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import Items from './items.component';
import { waitFor, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { paths } from '../view/viewTabs.component';

describe('Items', () => {
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(
      <Routes>
        <Route path={paths.items} element={<Items />}></Route>
      </Routes>,
      path
    );
  };

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Back to Cameras table view' })
      ).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Back to Cameras table view',
    });
    expect(url).toHaveAttribute('href', '/catalogue/4');
  });

  it('navigates to catalogue item landing page', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Back to Cameras 1 landing page' })
      ).toBeInTheDocument();
    });

    const url = screen.getByRole('link', {
      name: 'Back to Cameras 1 landing page',
    });
    expect(url).toHaveAttribute('href', '/catalogue/item/1');
  });
});
