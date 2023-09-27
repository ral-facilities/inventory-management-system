import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Manufacturer from './manufacturer.component';

describe('Manufacturer', () => {
  // let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(<Manufacturer />);
  };

  it('renders table headers correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('renders table data correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    expect(screen.getByText('Manufacturer B')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer C')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.co.uk')).toBeInTheDocument();
    expect(screen.getByText('123test.com')).toBeInTheDocument();
    expect(screen.getByText('10 My Street')).toBeInTheDocument();
    expect(screen.getByText('11 My Street')).toBeInTheDocument();
    expect(screen.getByText('12 My Street')).toBeInTheDocument();
  });

  // it('clicking on manufacturer url opens page in new tab', async () => {
  //   createView();
  //   await waitFor(() => {
  //     expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
  //   })
  //   const url = await screen.findByText('example.com')
  //   await user.click(url).should("not-disbaled")

  // });
});
