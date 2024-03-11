import React from 'react';
import { renderComponentWithRouterProvider } from '../setupTests';
import Items from './items.component';
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));
describe('Items', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<Items />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/1/items');

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'cameras',
        })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('link', {
      name: 'cameras',
    });
    await user.click(breadcrumb);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue/4');
  });

  it('navigates to catalogue item landing page', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Cameras 1' })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('link', {
      name: 'Cameras 1',
    });
    await user.click(breadcrumb);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue/item/1');
  });

  it('navigates back to the root directory', async () => {
    createView('/catalogue/item/1/items');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Cameras 1' })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');
  });

  it('renders no item page correctly', async () => {
    createView('/catalogue/item/1fghj/items');
    await waitFor(() => {
      expect(
        screen.getByText(
          `These items don't exist. Please click the Home button on the top left of you screen to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });
  });
});
