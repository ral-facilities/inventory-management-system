import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen } from '@testing-library/react';
import CatalogueCard, { CatalogueCardProps } from './catalogueCard.component';

describe('Catalogue Card', () => {
  let props: CatalogueCardProps;
  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueCard {...props} />);
  };

  it('renders text correctly', async () => {
    props = {
      id: '1',
      name: 'Beam Characterization',
      parent_id: '',
      code: 'beam-characterization',
      is_leaf: false,
      parent_path: '/',
      path: '/beam-characterization',
    };
    createView();
    expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
  });
});
