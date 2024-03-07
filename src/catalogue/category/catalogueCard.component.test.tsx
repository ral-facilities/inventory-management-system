import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithBrowserRouter } from '../../testUtils';
import CatalogueCard, { CatalogueCardProps } from './catalogueCard.component';

describe('Catalogue Card', () => {
  let props: CatalogueCardProps;
  let user;

  const onChangeOpenDeleteDialog = vi.fn();
  const onChangeOpenEditDialog = vi.fn();
  const onToggleSelect = vi.fn();
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

  it('opens the actions menu and closes it', async () => {
    createView();
    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'edit Beam Characterization catalogue category button',
    });

    const saveAsButton = screen.getByRole('menuitem', {
      name: 'save as Beam Characterization catalogue category button',
    });

    const deleteButton = screen.getByRole('menuitem', {
      name: 'delete Beam Characterization catalogue category button',
    });

    expect(editButton).toBeVisible();
    expect(deleteButton).toBeVisible();
    expect(saveAsButton).toBeVisible();

    await user.click(editButton);
    await user.click(
      screen.getByRole('button', {
        name: 'actions Beam Characterization catalogue category button',
      })
    );
    expect(editButton).not.toBeVisible();
  });

  it('opens the delete dialog', async () => {
    createView();
    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const deleteButton = screen.getByRole('menuitem', {
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
    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'edit Beam Characterization catalogue category button',
    });
    await user.click(editButton);

    expect(onChangeOpenEditDialog).toHaveBeenCalled();
  });
});
