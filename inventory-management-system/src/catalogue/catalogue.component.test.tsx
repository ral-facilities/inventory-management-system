import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen } from '@testing-library/react';
import Catalogue from './catalogue.component';

describe('Catalogue', () => {
  const createView = () => {
    return renderComponentWithBrowserRouter(<Catalogue />);
  };

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Catalogue Page')).toBeInTheDocument();
  });
});
