import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen } from '@testing-library/react';
import CatalogueCard, { CatalogueCardProps } from './catalogueCard.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Card', () => {
  let props: CatalogueCardProps;
  let user;

  const onChangeOpenDeleteDialog = jest.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueCard {...props} />);
  };

  beforeEach(() => {
    props = {
      id: '1',
      name: 'Beam Characterization',
      parent_id: '',
      code: 'beam-characterization',
      is_leaf: false,
      parent_path: '/',
      path: '/beam-characterization',
      onChangeOpenDeleteDialog: onChangeOpenDeleteDialog,
    };
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
  });

  it('opens the delete dialog', async () => {
    createView();
    const deleteButton = screen.getByTestId('delete-catalogue-category-button');
    await user.click(deleteButton);

    expect(onChangeOpenDeleteDialog).toHaveBeenCalled();
  });
});
