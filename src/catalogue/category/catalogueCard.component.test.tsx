import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueCard, { CatalogueCardProps } from './catalogueCard.component';

describe('Catalogue Card', () => {
  let props: CatalogueCardProps;
  let user: UserEvent;

  const onChangeOpenDeleteDialog = vi.fn();
  const onChangeOpenEditDialog = vi.fn();
  const onChangeOpenDuplicateDialog = vi.fn();
  const onToggleSelect = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(<CatalogueCard {...props} />);
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
      onChangeOpenDuplicateDialog: onChangeOpenDuplicateDialog,
      isSelected: false,
      onToggleSelect: onToggleSelect,
      created_time: '2024-01-01T12:00:00.000+00:00',
      modified_time: '2024-01-02T13:10:10.000+00:00',
      properties: [],
    };
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    createView();
    expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
  });

  it('opens the items landing page actions menu and closes it', async () => {
    props.is_leaf = true;
    createView();
    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'edit Beam Characterization catalogue category button',
    });

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'duplicate Beam Characterization catalogue category button',
    });

    const deleteButton = screen.getByRole('menuitem', {
      name: 'delete Beam Characterization catalogue category button',
    });

    expect(editButton).toBeVisible();

    expect(deleteButton).toBeVisible();
    expect(duplicateButton).toBeVisible();

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

  it('opens the duplicate dialog', async () => {
    props.is_leaf = true;
    createView();
    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'duplicate Beam Characterization catalogue category button',
    });
    await user.click(editButton);

    expect(onChangeOpenDuplicateDialog).toHaveBeenCalled();
  });
});
