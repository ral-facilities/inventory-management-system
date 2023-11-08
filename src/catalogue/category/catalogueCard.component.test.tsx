import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { screen } from '@testing-library/react';
import CatalogueCard, { CatalogueCardProps } from './catalogueCard.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Card', () => {
  let props: CatalogueCardProps;
  let user;

  const onChangeOpenDeleteDialog = jest.fn();
  const onChangeOpenEditDialog = jest.fn();
  const onToggleSelect = jest.fn();
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
      onChangeOpenDeleteDialog: onChangeOpenDeleteDialog,
      onChangeOpenEditDialog: onChangeOpenEditDialog,
      isSelected: false,
      onToggleSelect: onToggleSelect,
    };
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
  });

  it('opens the delete dialog', async () => {
    createView();
    const deleteButton = screen.getByRole('button', {
      name: 'delete Beam Characterization catalogue category button',
    });
    await user.click(deleteButton);

    expect(onChangeOpenDeleteDialog).toHaveBeenCalled();
  });

  it('checks the checkbox', async () => {
    createView();
    const checkbox = screen.getByLabelText('Beam Characterization checkbox');

    await user.click(checkbox);

    expect(onToggleSelect).toHaveBeenCalled();
  });

  it('opens the edit dialog', async () => {
    createView();
    const editButton = screen.getByRole('button', {
      name: 'edit Beam Characterization catalogue category button',
    });
    await user.click(editButton);

    expect(onChangeOpenEditDialog).toHaveBeenCalled();
  });
});
