import { zodResolver } from '@hookform/resolvers/zod';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';
import { CatalogueCategory } from '../../../api/api.types';
import { CatalogueCategorySchema } from '../../../form.schemas';
import { RootState } from '../../../state/store';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../../testUtils';
import { transformToAddCatalogueCategoryWithPlacementIds } from '../catalogueCategoryDialog.component';
import PropertiesTable, {
  PropertiesTableProps,
} from './catalogueItemPropertiesTable.component';

const TestComponent = (props: PropertiesTableProps) => {
  const formMethods = useForm<
    z.input<typeof CatalogueCategorySchema>,
    undefined,
    z.output<typeof CatalogueCategorySchema>
  >({
    resolver: zodResolver(CatalogueCategorySchema),
    defaultValues: transformToAddCatalogueCategoryWithPlacementIds(
      getCatalogueCategoryById('12') as CatalogueCategory
    ),
  });

  return (
    <FormProvider {...formMethods}>
      <PropertiesTable {...props} />
    </FormProvider>
  );
};

describe('CatalogueItemPropertiesTable', () => {
  let props: PropertiesTableProps;
  let user: UserEvent;
  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <TestComponent {...props} />,
      undefined,
      undefined,
      preloadedState
    );
  };

  beforeEach(() => {
    props = {
      requestType: 'patch',
      catalogueCategory: getCatalogueCategoryById('12') as CatalogueCategory,
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (not editing properties)', async () => {
    const { asFragment } = createView();
    expect(screen.getByRole('table')).toBeInTheDocument();
    const pumpingSpeed = await screen.findByText('Pumping Speed');
    expect(pumpingSpeed).toBeInTheDocument();

    const pumpingSpeedUnit = await screen.findByText('liters per second');
    expect(pumpingSpeedUnit).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('opens and closes the property add dialog', async () => {
    createView();

    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    const addButton = screen.getByText('Add Property');
    await user.click(addButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('opens and closes the property edit dialog', async () => {
    createView();

    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    expect(
      await screen.findByLabelText('Edit property Pumping Speed')
    ).toBeInTheDocument();

    const editButton = screen.getByLabelText('Edit property Pumping Speed');
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

  it('can open the property edit as admin dialog', async () => {
    createView({
      authorisation: {
        role: 'admin',
        isAdminUser: true,
        isAdminMode: true,
      },
    });

    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    expect(
      await screen.findByLabelText('Edit property Pumping Speed as admin')
    ).toBeInTheDocument();

    const editButton = screen.getByLabelText(
      'Edit property Pumping Speed as admin'
    );
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

  it('can open the property delete dialog (admin)', async () => {
    createView({
      authorisation: {
        role: 'admin',
        isAdminUser: true,
        isAdminMode: true,
      },
    });

    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    expect(
      await screen.findByLabelText('Delete property Pumping Speed as admin')
    ).toBeInTheDocument();

    const deleteButton = screen.getByLabelText(
      'Delete property Pumping Speed as admin'
    );
    await user.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can change the table filters and clear the table filters', async () => {
    createView();

    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Filter by Name');
    await user.type(nameInput, 'Axis');
    await waitFor(() => {
      expect(screen.queryByText('Pumping Speed')).not.toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    await user.click(clearFiltersButton);
    expect(await screen.findByText('Pumping Speed')).toBeInTheDocument();

    expect(clearFiltersButton).toBeDisabled();
  });
});
