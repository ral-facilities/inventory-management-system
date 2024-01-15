import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import ManufacturerLandingPage from './manufacturerLandingPage.component';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { paths } from '../view/viewTabs.component';

const mockedUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}));
describe('Manufacturer Landing page', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(
      <Routes>
        <Route
          path={paths.manufacturer}
          element={<ManufacturerLandingPage />}
        ></Route>
      </Routes>,
      path
    );
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('landing page renders data correctly', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to manufacturer home',
        })
      ).toBeInTheDocument();
    });
    expect(screen.getByText('URL:')).toBeInTheDocument();
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
    expect(screen.getByText('Telephone number:')).toBeInTheDocument();
    expect(screen.getByText('07334893348')).toBeInTheDocument();
    expect(screen.getByText('Address:')).toBeInTheDocument();
  });

  it('navigates back to the root directory', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to manufacturer home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toBeCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/manufacturer');
  });

  it('shows no manufacturer page correctly', async () => {
    createView('/manufacturer/invalid');

    await waitFor(() => {
      expect(
        screen.getByText(
          `This manufacturer doesn't exist. Please click the Home button to navigate to the manufacturer table`
        )
      ).toBeInTheDocument();
    });
  });

  it('shows the loading indicator', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('opens and closes the edit manufacturer dialog', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'Edit',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('prints when the button is clicked', async () => {
    const spy = jest.spyOn(window, 'print').mockImplementation(() => {});
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: 'Print' });

    await user.click(printButton);
    // Assert that the window.print() function was called
    expect(spy).toHaveBeenCalled();

    // Clean up the mock
    spy.mockRestore();
  });
});
