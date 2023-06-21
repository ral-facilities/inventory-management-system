import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen } from '@testing-library/react';
import Manufacturer from './manufacturer.component';

describe('Manufacturer', () => {
  const createView = () => {
    return renderComponentWithBrowserRouter(<Manufacturer />);
  };

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Manufacturer Page')).toBeInTheDocument();
  });
});
